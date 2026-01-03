/**
 * Social Service - Switcher
 * Automatically switches between Firebase and Turso implementations
 */

import * as firebaseImpl from "./firebase";
import * as tursoImpl from "../turso/socialService";

const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === "true";

const implementation = USE_TURSO ? tursoImpl : firebaseImpl;

export const {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  createComment,
  getComments,
  deleteComment,
  createSuggestion,
  getSuggestions,
  updateSuggestion,
  acceptSuggestion,
  voteSuggestion,
  toggleLike,
  hasUserLiked,
  sharePost,
  votePoll,
  getPollVotes,
  getUserSocialStats,
} = implementation;
