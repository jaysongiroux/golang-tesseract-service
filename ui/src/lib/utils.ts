import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Smoothly scrolls to the element with the given ID
 * @param elementId - ID of the element to scroll to
 * @param offset - Additional offset from the top (default: 80px for header)
 */
export function smoothScrollTo(elementId: string, offset = 80): void {
  const element = document.getElementById(elementId);

  if (element) {
    // Prevent default browser behavior that might scroll to the top first
    // by using element.scrollIntoView instead of window.scrollTo

    // We'll use scrollIntoView with a custom scroll behavior
    // and then adjust for the header offset
    element.scrollIntoView({ behavior: "smooth", block: "start" });

    // Adjust for header offset
    setTimeout(() => {
      window.scrollBy({
        top: -offset,
        behavior: "smooth",
      });
    }, 10);
  }
}
