import Link from 'next/link'
import { getAllPosts } from '@/lib/notion'

export async function getStaticProps() {
    const posts = await getAllPosts()
    return { props: { posts } }
}

export default function Home({ posts }: any) {
    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-4">The Lore Society</h1>
            <ul className="space-y-2">
                {posts.map((post: any) => (
                    <li key={post.id}>
                        <Link href={`/posts/${post.id}`}>
                            <a className="text-blue-600 hover:underline">
                                {post.Title}
                            </a>
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    )
}
