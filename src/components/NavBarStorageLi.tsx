import { MdOutlineInventory2 } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function NavBarStorageLi() {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    console.log("path", path);

    router.push(`/${path}`);
  };

  return (
    <>
      <li>
        <button
          type="button"
          className="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          aria-controls="dropdown-authentication"
          data-collapse-toggle="dropdown-authentication"
        >
          <MdOutlineInventory2 className="w-6 h-6" />
          <span className="flex-1 ml-3 text-left whitespace-nowrap">
            Storage
          </span>
          <svg
            aria-hidden="true"
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <ul id="dropdown-authentication" className="hidden py-2 space-y-2">
          <li>
            <button
              onClick={() => handleNavigation("storage")}
              className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Storage Management
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigation("category")}
              className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Category Management
            </button>
          </li>
          {/* <li>
            <a
              href="#"
              className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Forgot Password
            </a>
          </li> */}
        </ul>
      </li>
    </>
  );
}
