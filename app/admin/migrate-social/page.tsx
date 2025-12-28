"use client";

import { useState } from "react";
import { db as firebaseDb } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { db as tursoDb } from "@/turso/client";
import { Post, Comment, Suggestion, Like } from "@/lib/models/social";

export default function MigrateSocialPage() {
  const [status, setStatus] = useState<"Ready" | "Running" | "Done" | "Error">(
    "Ready"
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const log = (msg: string) =>
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const runMigration = async () => {
    setStatus("Running");
    setLogs([]);
    log("Starting migration...");

    try {
      // Disable FK checks (Turso/SQLite)
      await tursoDb.execute("PRAGMA foreign_keys = OFF");
      log("Foreign keys disabled");

      // 1. Migrate Posts
      log("Fetching posts from Firebase...");
      const postsSnap = await getDocs(collection(firebaseDb, "posts"));
      const posts = postsSnap.docs.map((doc) => doc.data() as Post);
      log(`Found ${posts.length} posts in Firebase`);

      for (const post of posts) {
        try {
          // Check existence
          const existing = await tursoDb.execute({
            sql: "SELECT post_id FROM social_posts WHERE post_id = ?",
            args: [post.postId],
          });

          if (existing.rows.length === 0) {
            await tursoDb.execute({
              sql: `INSERT INTO social_posts (
                          post_id, user_id, user_email, content, media_type,
                          cefr_level, grammar_focus, vocabulary_used,
                          likes_count, comments_count, suggestions_count, shares_count,
                          visibility, is_edited, has_accepted_suggestion,
                          created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                post.postId,
                post.userId,
                post.userEmail,
                post.content,
                post.mediaType || "none",
                post.cefrLevel,
                post.grammarFocus ? JSON.stringify(post.grammarFocus) : null,
                post.vocabularyUsed
                  ? JSON.stringify(post.vocabularyUsed)
                  : null,
                post.likesCount || 0,
                post.commentsCount || 0,
                post.suggestionsCount || 0,
                post.sharesCount || 0,
                post.visibility,
                post.isEdited ? 1 : 0,
                post.hasAcceptedSuggestion ? 1 : 0,
                post.createdAt,
                post.updatedAt,
              ],
            });
            log(`Migrated post ${post.postId}`);
          } else {
            // log(`Skipped post ${post.postId} (exists)`);
          }
        } catch (e) {
          log(`Error migrating post ${post.postId}: ${e}`);
        }
      }

      // 2. Migrate Comments
      log("Fetching comments from Firebase...");
      const commentsSnap = await getDocs(collection(firebaseDb, "comments"));
      const comments = commentsSnap.docs.map((doc) => doc.data() as Comment);
      log(`Found ${comments.length} comments`);

      for (const comment of comments) {
        try {
          const existing = await tursoDb.execute({
            sql: "SELECT comment_id FROM social_comments WHERE comment_id = ?",
            args: [comment.commentId],
          });

          if (existing.rows.length === 0) {
            await tursoDb.execute({
              sql: `INSERT INTO social_comments (
                          comment_id, post_id, user_id, parent_comment_id, content,
                          likes_count, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                comment.commentId,
                comment.postId,
                comment.userId,
                comment.parentCommentId || null,
                comment.content,
                comment.likesCount || 0,
                comment.createdAt,
                comment.updatedAt,
              ],
            });
            log(`Migrated comment ${comment.commentId}`);
          }
        } catch (e) {
          log(`Error migrating comment ${comment.commentId}: ${e}`);
        }
      }

      // 3. Migrate Suggestions
      log("Fetching suggestions from Firebase...");
      const suggestionsSnap = await getDocs(
        collection(firebaseDb, "suggestions")
      );
      const suggestions = suggestionsSnap.docs.map(
        (doc) => doc.data() as Suggestion
      );
      log(`Found ${suggestions.length} suggestions`);

      for (const suggestion of suggestions) {
        try {
          const existing = await tursoDb.execute({
            sql: "SELECT suggestion_id FROM social_suggestions WHERE suggestion_id = ?",
            args: [suggestion.suggestionId],
          });

          if (existing.rows.length === 0) {
            await tursoDb.execute({
              sql: `INSERT INTO social_suggestions (
                          suggestion_id, post_id, suggested_by, suggested_to,
                          original_text, suggested_text, explanation, grammar_rule,
                          position_start, position_end, type, severity, status,
                          upvotes, downvotes, created_at, updated_at, accepted_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                suggestion.suggestionId,
                suggestion.postId,
                suggestion.suggestedBy,
                suggestion.suggestedTo,
                suggestion.originalText,
                suggestion.suggestedText,
                suggestion.explanation ?? null,
                suggestion.grammarRule ?? null,
                suggestion.position?.start ?? null,
                suggestion.position?.end ?? null,
                suggestion.type ?? "other",
                suggestion.severity ?? "suggestion",
                suggestion.status ?? "pending",
                suggestion.upvotes ?? 0,
                suggestion.downvotes ?? 0,
                suggestion.createdAt,
                suggestion.updatedAt,
                suggestion.acceptedAt ?? null,
              ],
            });
            log(`Migrated suggestion ${suggestion.suggestionId}`);
          }
        } catch (e) {
          log(`Error migrating suggestion ${suggestion.suggestionId}: ${e}`);
        }
      }

      // 4. Migrate Likes
      log("Fetching likes from Firebase...");
      const likesSnap = await getDocs(collection(firebaseDb, "likes"));
      const likes = likesSnap.docs.map((doc) => doc.data() as Like);
      log(`Found ${likes.length} likes`);

      for (const like of likes) {
        try {
          const existing = await tursoDb.execute({
            sql: "SELECT like_id FROM social_likes WHERE like_id = ?",
            args: [like.likeId],
          });

          if (existing.rows.length === 0) {
            await tursoDb.execute({
              sql: `INSERT INTO social_likes (
                          like_id, user_id, target_id, target_type, created_at
                        ) VALUES (?, ?, ?, ?, ?)`,
              args: [
                like.likeId,
                like.userId,
                like.targetId,
                like.targetType,
                like.createdAt,
              ],
            });
            log(`Migrated like ${like.likeId}`);
          }
        } catch (e) {
          log(`Error migrating like ${like.likeId}: ${e}`);
        }
      }

      await tursoDb.execute("PRAGMA foreign_keys = ON");
      log("Migration complete!");
      setStatus("Done");
    } catch (e) {
      log(`Fatal error: ${e}`);
      setStatus("Error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">
        Social Data Migration (Firebase → Turso)
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <p className="mb-4 text-gray-600">
          This tool will copy all Posts, Comments, Suggestions, and Likes from
          Firebase Firestore to the Turso SQLite database. It will skip items
          that already exist.
        </p>

        <button
          onClick={runMigration}
          disabled={status === "Running"}
          className={`px-6 py-2 rounded-md font-medium text-white ${
            status === "Running"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {status === "Running" ? "Migrating..." : "Start Migration"}
        </button>
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <span className="text-gray-500">Ready to start...</span>
        ) : (
          logs.map((msg, i) => <div key={i}>{msg}</div>)
        )}
      </div>
    </div>
  );
}
