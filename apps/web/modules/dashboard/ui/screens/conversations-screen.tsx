import Image from "next/image";

type Props = {};
export const ConversationsScreen = ({}: Props) => {
  return (
    <div className="flex h-full flex-1 flex-col bg-muted gap-y-4">
      <div className="flex justify-center items-center flex-1 gap-x-2">
        <Image
          src={"/logo.png"}
          alt="placeholder"
          width={40}
          height={40}
          className="rounded-full"
        />
        <p className="font-semibold text-lg">Echo</p>
      </div>
    </div>
  );
};
