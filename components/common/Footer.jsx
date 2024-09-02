import Link from "next/link";
import { FaDiscord, FaLinkedin, FaSlack } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="text-center py-2 text-sm font-light px-2 items-center flex flex-col dark:text-neutral-400">
      <p>Connect with us</p>
      <div className="flex items-center gap-4 text-2xl my-2">
        <Link target="_blank" href={"https://discord.gg/VCh32gdDQ7"}>
          <FaDiscord />
        </Link>
        <Link target="_blank" href={"https://www.linkedin.com/company/elostack"}>
          <FaLinkedin />
        </Link>
        <Link target="_blank" href={"https://elostack.slack.com/"}>
          <FaSlack />
        </Link>
      </div>
      <p>Copyright © 2024 EloStack, Inc. All Rights Reserved.</p>
      <div className="flex justify-center items-center gap-2">
        <Link href="/terms-and-conditions.html" className="hover:underline">
          Terms & Conditions.
        </Link>
        <Link href="/privacy-notice.html" className="hover:underline ">
          Privacy Notice.
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
