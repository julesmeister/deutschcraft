import { db } from '@/turso/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DebugSocialPage() {
  const session = await getServerSession(authOptions);
  
  // Fetch all posts raw
  const postsResult = await db.execute('SELECT * FROM social_posts');
  const posts = postsResult.rows;

  // Fetch all users to check IDs
  const usersResult = await db.execute('SELECT user_id, email, role FROM users');
  const users = usersResult.rows;

  return (
    <div className="p-8 font-mono text-sm text-black">
      <h1 className="text-2xl font-bold mb-4">Debug Social Data</h1>
      
      <div className="mb-8 bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Current Session</h2>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>

      <div className="mb-8 bg-blue-50 p-4 rounded">
        <h2 className="font-bold mb-2">Database Posts ({posts.length})</h2>
        {posts.length === 0 ? (
            <p className="text-red-600">No posts found in 'social_posts' table.</p>
        ) : (
            <div className="space-y-4">
                {posts.map((post, i) => (
                    <div key={i} className="border p-2 bg-white">
                        <div><strong>ID:</strong> {post.post_id}</div>
                        <div><strong>User ID:</strong> {post.user_id}</div>
                        <div><strong>Email:</strong> {post.user_email}</div>
                        <div><strong>Content:</strong> {post.content}</div>
                        <div><strong>Created:</strong> {new Date(Number(post.created_at)).toLocaleString()}</div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="mb-8 bg-green-50 p-4 rounded">
        <h2 className="font-bold mb-2">Database Users ({users.length})</h2>
        <div className="max-h-60 overflow-y-auto">
             <table className="w-full text-left">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u, i) => (
                        <tr key={i} className={session?.user?.email === u.email ? "bg-yellow-200" : ""}>
                            <td>{u.user_id}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
      </div>
    </div>
  );
}
