import { useAuthContext } from "../../hooks/useAuthContext";
import ProfilePic from '../../assets/placeholders/pfp_placeholder.avif';
import BGImage from '../../assets/placeholders/bg_placeholder.avif';
import { Link } from "react-router-dom";


const MiniProfileBox: React.FC = () => {
    const { user } = useAuthContext();
    const username: string = `${user ? (user.first_name + ' ' + user.last_name) : 'Loading...'}`;
    const bio: string = user?.biography || "ICS Alumnus"
    const location: string = user?.location || "Earth"

    return (
        <Link to="/user/profile">
            <button className="flex flex-col w-full h-full">
                <div className="relative flex flex-col items-center w-full bg-black h-1/3">
                    <img src={BGImage} className="object-cover w-full h-full" />
                    <div className="absolute h-full rounded-full aspect-w-1 aspect-h-1 bg-Gradient2 -bottom-7">
                        <img src={ProfilePic} className="object-cover w-full h-full p-1 rounded-full"/>
                    </div>
                </div>
                <div className="w-full px-5 h-2/3 py-9 text-start">
                    <h3 className="text-sm font-medium text-Primary">{username}</h3>
                    <h4 className="text-xs text-Primary" style={{ whiteSpace: "pre-line" }}>{bio}</h4>
                    <h4 className="text-xs text-[#A3BDDB]">{location}</h4>
                </div>
            </button>
        </Link>
    );
}

export default MiniProfileBox;