// import Badge from "./Badge";  CREATE SEP BADGE FOR READING GROUP IF TYPES OF GROUPS ARE NEEDED
import ReadingGroupCardFooter from "./ReadingGroupCardFooter";
import thumbnail from "../images/design_vii.jpg";
import { Link } from "react-router-dom";
import { resolveMediaUrl } from "@/api";

const ReadingGroupCard = ({reading_group}) => {
  return (
    <div className="px-3 py-3 rounded-md w-[300px] h-auto flex flex-col gap-4 dark:border-gray-800 border   shadow-lg">
      <Link to={`/groups/${reading_group.slug}`}>
      <div className="w-full h-[200px] border rounded-md overflow-hidden">
        <img
          src={resolveMediaUrl(reading_group.featured_image)}  
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      </Link>

      {/* <Badge reading_group={reading_group} /> */}

      <Link to={`/groups/${reading_group.slug}`}>
        <h3 className="font-semibold  leading-normal text-[#181A2A] mb-0 dark:text-white">
          {reading_group.name}
        </h3>
      </Link>

      <ReadingGroupCardFooter reading_group={reading_group} />
    </div>
  );
};

export default ReadingGroupCard;
