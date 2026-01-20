/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'spline-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        url?: string;
        'loading-anim'?: boolean;
        'loading-anim-type'?: string;
      },
      HTMLElement
    >;
  }
}
