import { useIntersectionObserver } from "usehooks-ts";

type ImageProps = {
  loadOnScroll?: boolean;
} & React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * A component that displays a gif image.
 * The gif starts playing when the image is in the viewport.
 */
export default function Image({
  src,
  alt = "",
  loadOnScroll = false,
  ...props
}: ImageProps) {
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0
  });

  return (
    <img
      ref={ref}
      src={isIntersecting || !loadOnScroll ? src : ""}
      alt={alt}
      {...props}
    />
  );
}
