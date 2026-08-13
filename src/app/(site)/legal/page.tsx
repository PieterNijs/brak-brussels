import { client } from '@/lib/sanity'
import { TextPage } from '@/components/TextPage'

async function getPage() {
  return client.fetch(
    `*[_type == "page" && slug.current == "legal"][0]{ title, content }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export default async function LegalPage() {
  const page = await getPage()
  return <TextPage title={page?.title ?? 'Legal notice'} content={page?.content} />
}
