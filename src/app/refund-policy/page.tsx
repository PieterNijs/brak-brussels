import { client } from '@/lib/sanity'
import { TextPage } from '@/components/TextPage'

async function getPage() {
  return client.fetch(
    `*[_type == "page" && slug.current == "refund-policy"][0]{ title, content }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export default async function RefundPolicyPage() {
  const page = await getPage()
  return <TextPage title={page?.title ?? 'Refund policy'} content={page?.content} />
}
