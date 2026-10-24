import Feed from "@/components/Feed";
import { FeedMasthead } from "@/components/Masthead";
import { LegacyHashRedirect } from "@/components/Nav";

export default function Home() {
  return (
    <>
      <LegacyHashRedirect />
      <FeedMasthead />
      <Feed />
    </>
  );
}
