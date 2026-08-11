import { PortableText, PortableTextComponents } from 'next-sanity'
import styles from './TextPage.module.css'

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
    normal: ({ children }) => <p className={styles.p}>{children}</p>,
  },
  marks: {
    link: ({ value, children }) => (
      <a
        href={value?.href}
        className={styles.link}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className={styles.ul}>{children}</ul>,
    number: ({ children }) => <ol className={styles.ol}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className={styles.li}>{children}</li>,
    number: ({ children }) => <li className={styles.li}>{children}</li>,
  },
}

type Props = {
  title: string
  content?: any[]
}

export function TextPage({ title, content }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        {content && content.length > 0 && (
          <div className={styles.body}>
            <PortableText value={content} components={components} />
          </div>
        )}
      </div>
    </div>
  )
}
