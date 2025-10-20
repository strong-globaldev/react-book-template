import { LightBulbIcon } from "../../Icons";

export default function QuizHotspot() {
  return (
    <div
      className={`flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#111111] text-[#15BFFF] outline outline-[5px] outline-white`}
    >
      <LightBulbIcon className="h-14 w-14" />
    </div>
  );
}
