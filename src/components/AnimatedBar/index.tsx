import { useState } from "react";
import { ActionIcon, Group, Box, rem, Tooltip } from "@mantine/core";
import { BsFiletypeCsv } from "react-icons/bs";
import { RxCross1, RxFilePlus } from "react-icons/rx";
import { IconDownload } from "@tabler/icons-react";
import { VscRefresh } from "react-icons/vsc";
import { keyframes } from "@emotion/react";

const fadeInUp = keyframes({
  from: {
    opacity: 0,
    transform: "translateY(10px)",
  },
  to: {
    opacity: 1,
    transform: "translateY(0)",
  },
});

const ExpandedActionBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleIconClick = (action: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Clicked ${action} button`);

    if (action === "close") {
      setIsExpanded(false);
    }
  };

  const icons = [
    {
      Icon: BsFiletypeCsv,
      label: "Batch Uploads",
      tooltip: "Upload multiple items at once by CSV",
    },
    {
      Icon: RxFilePlus,
      label: "Add One Item",
      tooltip: "Add single item record",
    },
    {
      Icon: IconDownload,
      label: "Export",
      tooltip: "Export All Item Records Into CSV",
    },
    { Icon: VscRefresh, label: "Refresh", tooltip: "Refresh Item Records" },
    { Icon: RxCross1, label: "close", tooltip: "Close Menu" },
  ];

  return (
    <Box
      component="div"
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        width: isExpanded ? rem(384) : rem(64),
        height: rem(64),
        borderRadius: isExpanded ? rem(12) : rem(26),
        transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "var(--mantine-color-green-filled)",
        cursor: "pointer",
      }}
    >
      <Group
        gap={16}
        justify="center"
        w="100%"
        h="100%"
        style={{
          opacity: isExpanded ? 1 : 0,
          pointerEvents: isExpanded ? "auto" : "none",
          transition: "opacity 300ms ease",
        }}
      >
        {icons.map(({ Icon, label, tooltip }, index) => (
          <Tooltip key={label} label={tooltip} position="bottom">
            <Box
              component="div"
              onClick={handleIconClick(label.toLowerCase())}
              style={{
                color: "white",
                cursor: "pointer",
                animationName: isExpanded ? fadeInUp.name : "none",
                animationDuration: "300ms",
                animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                animationFillMode: "forwards",
                animationDelay: isExpanded ? `${index * 50}ms` : "0ms",
              }}
            >
              <Icon size={24} />
            </Box>
          </Tooltip>
        ))}
      </Group>
    </Box>
  );
};

export default ExpandedActionBar;
