import { MdOutlineInventory2 } from "react-icons/md";
import { FaWarehouse } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { useDropdownStore } from "@/store/useDropdownStore";

export default function NavBarStorageLi() {
  const { isOpen, toggle } = useDropdownStore();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    console.log("path", path);

    router.push(`/${path}`);
  };

  return (
    <li>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        aria-controls="dropdown-authentication"
        data-collapse-toggle="dropdown-authentication"
      >
        <MdOutlineInventory2 className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
        <span className="flex-1 ml-3 text-left whitespace-nowrap">Storage</span>
        <svg
          className={`w-6 h-6 ${isOpen ? "rotate-180" : ""}`}
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
      <ul
        id="dropdown-authentication"
        className={`${isOpen ? "block" : "hidden"} py-2 space-y-2`}
      >
        <li>
          <button
            onClick={() => handleNavigation("storage")}
            className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <FaWarehouse className="w-4 h-4 flex-shrink-0" />
              <span>Storage Management</span>
            </div>
          </button>
        </li>
        <li>
          <button
            onClick={() => handleNavigation("category")}
            className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <BiCategory className="w-4 h-4 flex-shrink-0" />
              <span>Category Management</span>
            </div>
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
  );
}
