import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import { ArrowUpRight } from "lucide-react";

export function ProfileSocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  const definition =
    key === "facebook"
      ? faFacebookF
      : key === "instagram"
        ? faInstagram
        : key === "linkedin"
          ? faLinkedinIn
          : undefined;
  if (!definition) return <ArrowUpRight aria-hidden="true" />;
  const [width, height, , , paths] = definition.icon;
  return (
    <svg
      className="vp-social-icon"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      {(Array.isArray(paths) ? paths : [paths]).map((path, index) => (
        <path d={path} key={index} />
      ))}
    </svg>
  );
}
