import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      description: 'Used as the default title and in the title template for all pages.',
    }),
    defineField({
      name: 'siteDescription',
      title: 'Default Description',
      type: 'text',
      rows: 3,
      description: 'Fallback description shown in search results and social sharing (max 160 chars).',
    }),
    defineField({
      name: 'ogImage',
      title: 'Default Social Image',
      type: 'image',
      description:
        'Fallback image used when sharing the site on social media (1200 × 630 px recommended). Products use their own first image automatically.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
