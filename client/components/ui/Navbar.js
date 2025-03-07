import Image from "next/image";
import Link from "next/link";
<ConnectButton client={client} chain={chain} />;
import { ConnectButton } from "thirdweb/react";
import { client } from "../../web3/client";
import { chain } from "../../web3/chain";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between h-18 px-8 bg-black shadow-md">
      <div className="flex items-center">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={195} height={170} priority />
        </Link>
      </div>

      <div>
        <ConnectButton client={client} chain={chain} />
      </div>
    </nav>
  );
};

export default Navbar;
