import React from "react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export const Breadcrumb: React.FC<Props> = ({ items }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="flex-shrink-0 h-5 w-5 text-muted mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
            )}
            {item.href && index < items.length - 1 ? (
              <a
                href={item.href}
                className="text-sm font-medium text-muted hover:text-primary"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-sm font-medium text-primary">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
