/* eslint-disable @next/next/no-img-element */
import remarkGfm from "remark-gfm";
import ReactMarkdown, { Components } from "react-markdown";

export interface MarkdownProps {
  children: string;
  className?: string;
}

export default function Markdown({ children, className }: MarkdownProps) {
  const components: Components = {
    h1: ({ children }) => (
      <h1 className="mt-2 mb-1 text-2xl md:text-3xl font-bold text-foreground">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-2 mb-1 text-xl md:text-2xl font-semibold text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-2 mb-1 text-lg md:text-xl font-semibold text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-2 mb-1 text-base md:text-lg font-semibold text-foreground">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="my-1 leading-6 text-foreground">{children}</p>
    ),
    ul: ({ children }) => <ul className="my-2 ml-5 list-disc">{children}</ul>,
    ol: ({ children }) => (
      <ol className="my-2 ml-5 list-decimal">{children}</ol>
    ),
    li: ({ children }) => <li className="my-0.5">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-2 border-l-2 border-muted pl-3 text-muted-foreground">
        {children}
      </blockquote>
    ),
    code: (props) => {
      const anyProps = props as any;
      const inline = Boolean(anyProps?.inline);
      const { children, ...rest } = anyProps;
      return inline ? (
        <code
          className="rounded bg-muted px-1 py-0.5 text-foreground"
          {...rest}
        >
          {children}
        </code>
      ) : (
        <code
          className="block w-full rounded bg-muted p-3 text-foreground overflow-x-auto"
          {...rest}
        >
          {children}
        </code>
      );
    },
    a: ({ href, children, ...rest }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-blue-500 underline hover:opacity-80 break-all"
        {...rest}
      >
        {children}
      </a>
    ),
    img: ({ src, alt, ...rest }) => (
      <img
        src={src || ""}
        alt={alt || "image"}
        className="my-2 max-h-64 rounded border border-border"
        {...rest}
      />
    ),
  };

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
