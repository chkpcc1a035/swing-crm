import { Button } from "flowbite-react";
import { Modal } from "flowbite-react";

interface AddStorageItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStorageItemModal({
  isOpen,
  onClose,
}: AddStorageItemModalProps) {
  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      position="center"
      size="md"
      popup={false}
      theme={{
        content: {
          base: "relative h-full w-full p-4 md:h-auto",
          inner:
            "relative rounded-lg bg-white shadow dark:bg-gray-700 flex flex-col max-h-[90vh]",
        },
        root: {
          base: "bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40 backdrop-blur-sm",
        },
      }}
    >
      <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Add New Storage
        </h3>
      </Modal.Header>
      <Modal.Body className="!p-6">
        <div className="space-y-4">
          <p>Add your storage form fields here</p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-t border-gray-200 !p-6 dark:border-gray-700">
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button color="dark">Save</Button>
      </Modal.Footer>
    </Modal>
  );
}
