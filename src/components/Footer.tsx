import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner">
      <div className="w-full max-w-screen-xl mx-auto p-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
          {/* <ul className="flex flex-wrap items-center text-sm font-medium text-gray-500 dark:text-gray-400">
            <li>
              <Link href="/about" className="hover:underline me-4">
                About
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline me-4">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:underline me-4">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul> */}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Version 0.0.6-alpha
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()}{" "}
            <Link href="/" className="hover:underline">
              SwingCMS™
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
