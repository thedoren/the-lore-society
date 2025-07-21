import { NotionRenderer } from 'react-notion-x'
import { getPostContent } from '@/lib/notion'
import { GetStaticPaths, GetStaticProps } from 'next'
import dynamic from 'next/dynamic'

const Code = dynamic(() =>
    import('react-notion-x/build/third-party/code').then(m => m.Code)
)

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await fetch('https://notion-api.splitbee.io/v1/table/237fd6718d4080259478f954ae185516').then(res => res.json())
    const paths = posts.map((post: any) => ({
        params: { id: post.id }
    }))

    return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const recordMap = await getPostContent(params!.id as string)
    return { props: { recordMap } }
}

export default function Post({ recordMap }: any) {
    return <NotionRenderer recordMap={recordMap} fullPage darkMode={false} components={{ Code }} />
}
