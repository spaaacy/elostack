import Link from "next/link";

const Footer = () => {
  return (
    <footer className="text-center py-2 text-sm dark:font-light ">
      Copyright © 2024 EloStack, Inc. All Rights Reserved.
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
