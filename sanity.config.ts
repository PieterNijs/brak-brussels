'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { media } from 'sanity-plugin-media'
import { schemaTypes } from './sanity/schemas'
import { DeleteWithImagesAction } from './sanity/actions/deleteWithImages'

export default defineConfig({
  basePath: '/studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            orderableDocumentListDeskItem({ type: 'product', S, context }),
            S.divider(),
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            // Other document types (page, etc.) — excludes product and siteSettings
            ...S.documentTypeListItems().filter(
              (listItem) =>
                !['product', 'siteSettings'].includes(listItem.getId() as string)
            ),
          ]),
    }),
    visionTool(),
    media(),
  ],

  document: {
    // Replace the built-in delete action with our custom one for products only
    actions: (prev, context) => {
      if (context.schemaType !== 'product') return prev
      return prev.map((action) =>
        action.action === 'delete' ? DeleteWithImagesAction : action
      )
    },
  },

  schema: {
    types: schemaTypes,
  },
})
