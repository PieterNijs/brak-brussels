import { client } from '@/lib/sanity'
import { TextPage } from '@/components/TextPage'

async function getPage() {
  return client.fetch(
    `*[_type == "page" && slug.current == "contact"][0]{ title, content }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export default async function ContactPage() {
  const page = await getPage()
  return <TextPage title={page?.title ?? 'Contact'} content={page?.content} />
}
