import { memo } from "react";
import { Card } from "@/components/ui/card";
import { PiTwitterLogo, PiDiscordLogo, PiTelegramLogo, PiGlobeBold } from "react-icons/pi";
import Image from "next/image";
import Link from "next/link";

interface ProjectCardProps {
  title: string;
  desc: string;
  logo: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  website?: string;
  category?: string;
}

export const ProjectCard = memo(function ProjectCard({
  title,
  desc,
  logo,
  twitter,
  discord,
  telegram,
  website,
  category
}: ProjectCardProps) {
  return (
    <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-5 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all">
      <div className="flex items-start gap-4">
        <div className="relative w-12 h-12">
          <Image
            src={logo}
            alt={title}
            fill
            className="rounded-lg object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] text-white font-medium">{title}</h3>
            {category && (
              <span className="text-xs text-[#83E9FF] bg-[#83E9FF20] px-2 py-1 rounded-full font-medium">
                {category}
              </span>
            )}
          </div>
          <p className="text-sm text-[#FFFFFF99] mt-2 font-normal">{desc}</p>
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        {website && (
          <Link href={website} target="_blank" rel="noopener noreferrer" className="text-[#83E9FF] hover:text-[#83E9FF80] transition-colors">
            <PiGlobeBold className="w-5 h-5" />
          </Link>
        )}
        {twitter && (
          <Link href={twitter} target="_blank" rel="noopener noreferrer" className="text-[#83E9FF] hover:text-[#83E9FF80] transition-colors">
            <PiTwitterLogo className="w-5 h-5" />
          </Link>
        )}
        {discord && (
          <Link href={discord} target="_blank" rel="noopener noreferrer" className="text-[#83E9FF] hover:text-[#83E9FF80] transition-colors">
            <PiDiscordLogo className="w-5 h-5" />
          </Link>
        )}
        {telegram && (
          <Link href={telegram} target="_blank" rel="noopener noreferrer" className="text-[#83E9FF] hover:text-[#83E9FF80] transition-colors">
            <PiTelegramLogo className="w-5 h-5" />
          </Link>
        )}
      </div>
    </Card>
  );
}); 