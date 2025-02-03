import { MdPayments } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useDropdownStore } from "@/store/useDropdownStore";

export default function NavBarPaymentLi() {
  const { isOpen, toggle } = useDropdownStore();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    console.log("path", path);
    router.push(`/${path}`);
  };

  return (
    <li className="relative">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        aria-controls="dropdown-payment"
        data-collapse-toggle="dropdown-payment"
      >
        <MdPayments className="min-w-[24px] h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
        <span className="flex-1 ml-3 text-left whitespace-nowrap overflow-hidden text-ellipsis">
          Payment
        </span>
        <svg
          className={`min-w-[24px] h-6 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <ul
        id="dropdown-payment"
        className={`${isOpen ? "block" : "hidden"} py-2 space-y-1 mt-1`}
      >
        <li>
          <button
            onClick={() => handleNavigation("payment")}
            className="flex items-center w-full p-2 pl-11 text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FaCreditCard className="flex-shrink-0 w-4 h-4" />
              <span className="truncate">Payment Management</span>
            </div>
          </button>
        </li>
        <li>
          <button
            onClick={() => handleNavigation("payment")}
            className="flex items-center w-full p-2 pl-11 text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FaMoneyBillTransfer className="flex-shrink-0 w-4 h-4" />
              <span className="truncate">Payment Gateway Management</span>
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
