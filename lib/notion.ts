export async function getAllPosts() {
    const res = await fetch('https://notion-api.splitbee.io/v1/table/237fd6718d4080259478f954ae185516')
    return res.json()
}

export async function getPostContent(pageId: string) {
    const res = await fetch(`https://notion-api.splitbee.io/v1/page/${pageId}`)
    return res.json()
}
