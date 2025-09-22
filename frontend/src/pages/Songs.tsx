import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Heart, ExternalLink, Search, Pause, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface Song {
  id: string;
  title: string;
  artist: string;
  mood: string;
  duration: string;
  youtubeUrl: string;
  thumbnail: string;
}

const Songs = () => {
  const [selectedMood, setSelectedMood] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const moods = ["All", "Chill", "Energetic", "Focus", "Happy", "Sad", "Angry", "Relaxed"];

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const playVideo = (song: Song) => {
    setCurrentSong(song);
    setIsPlayerOpen(true);
  };

  const closePlayer = () => {
    setIsPlayerOpen(false);
    setCurrentSong(null);
  };

  // All songs from your actual YouTube playlist with exact matching titles
  const songs: Song[] = [
    {
      id: "1",
      title: "Lose My Mind [From F1® The Movie] (feat. Doja Cat)",
      artist: "Don Toliver",
      mood: "Energetic",
      duration: "3:30",
      youtubeUrl: "https://youtube.com/watch?v=AVN7SJkNOR0",
      thumbnail: "https://i.ytimg.com/vi/AVN7SJkNOR0/maxresdefault.jpg"
    },
    {
      id: "2",
      title: "I Want It That Way",
      artist: "Backstreet Boys",
      mood: "Happy",
      duration: "3:30",
      youtubeUrl: "https://youtube.com/watch?v=LwkrXybZ1uo",
      thumbnail: "https://i.ytimg.com/vi/LwkrXybZ1uo/maxresdefault.jpg"
    },
    {
      id: "3",
      title: "Memory Reboot",
      artist: "VØJ & Narvent",
      mood: "Chill",
      duration: "3:34",
      youtubeUrl: "https://youtube.com/watch?v=EASIaOpeSTY",
      thumbnail: "https://i.ytimg.com/vi/EASIaOpeSTY/maxresdefault.jpg"
    },
    {
      id: "4",
      title: "I Can't Say Goodbye To You",
      artist: "Helen Reddy",
      mood: "Sad",
      duration: "3:30",
      youtubeUrl: "https://youtube.com/watch?v=O3VInGi9OLU",
      thumbnail: "https://i.ytimg.com/vi/O3VInGi9OLU/maxresdefault.jpg"
    },
    {
      id: "5",
      title: "Maging Sino Ka Man (Inspirational Version)",
      artist: "Martin Nievera",
      mood: "Relaxed",
      duration: "3:51",
      youtubeUrl: "https://youtube.com/watch?v=w9B1Ckhhyuw",
      thumbnail: "https://i.ytimg.com/vi/w9B1Ckhhyuw/maxresdefault.jpg"
    },
    {
      id: "6",
      title: "Attention",
      artist: "Charlie Puth",
      mood: "Happy",
      duration: "3:59",
      youtubeUrl: "https://youtube.com/watch?v=vxUBYHz_q1I",
      thumbnail: "https://i.ytimg.com/vi/vxUBYHz_q1I/maxresdefault.jpg"
    },
    {
      id: "7",
      title: "Fainted (Slowed)",
      artist: "Narvent",
      mood: "Chill",
      duration: "3:32",
      youtubeUrl: "https://youtube.com/watch?v=rpB6iJbhocA",
      thumbnail: "https://i.ytimg.com/vi/rpB6iJbhocA/maxresdefault.jpg"
    },
    {
      id: "8",
      title: "Rather Be (feat. Jess Glynne)",
      artist: "Clean Bandit",
      mood: "Energetic",
      duration: "4:57",
      youtubeUrl: "https://youtube.com/watch?v=dHdMAdh4Xgc",
      thumbnail: "https://i.ytimg.com/vi/dHdMAdh4Xgc/maxresdefault.jpg"
    },
    {
      id: "9",
      title: "Ngayong Gabi - Kai Honasan [Lyrics on Description]",
      artist: "ZakiChi Umetarou",
      mood: "Relaxed",
      duration: "3:48",
      youtubeUrl: "https://youtube.com/watch?v=Yqp4yJ5cYDo",
      thumbnail: "https://i.ytimg.com/vi/Yqp4yJ5cYDo/maxresdefault.jpg"
    },
    {
      id: "10",
      title: "A Thousand Miles",
      artist: "Vanessa Carlton",
      mood: "Relaxed",
      duration: "5:16",
      youtubeUrl: "https://youtube.com/watch?v=PNoIn1WKiEc",
      thumbnail: "https://i.ytimg.com/vi/PNoIn1WKiEc/maxresdefault.jpg"
    },
    {
      id: "11",
      title: "FUNK UNIVERSO (Slowed)",
      artist: "Irokz",
      mood: "Energetic",
      duration: "3:58",
      youtubeUrl: "https://youtube.com/watch?v=yHKXRcZxpG8",
      thumbnail: "https://i.ytimg.com/vi/yHKXRcZxpG8/maxresdefault.jpg"
    },
    {
      id: "12",
      title: "I Think They Call This Love (Cover)",
      artist: "Matthew Ifield",
      mood: "Relaxed",
      duration: "2:30",
      youtubeUrl: "https://youtube.com/watch?v=CnEqrgMlWLQ",
      thumbnail: "https://i.ytimg.com/vi/CnEqrgMlWLQ/maxresdefault.jpg"
    },
    {
      id: "13",
      title: "Young Black & Rich",
      artist: "Melly Mike",
      mood: "Energetic",
      duration: "3:17",
      youtubeUrl: "https://youtube.com/watch?v=5ObIlA0Y2yE",
      thumbnail: "https://i.ytimg.com/vi/5ObIlA0Y2yE/maxresdefault.jpg"
    },
    {
      id: "14",
      title: "Mahal Ka Sa Akin",
      artist: "Tanya",
      mood: "Sad",
      duration: "2:36",
      youtubeUrl: "https://youtube.com/watch?v=fAJLkS6MoOU",
      thumbnail: "https://i.ytimg.com/vi/fAJLkS6MoOU/maxresdefault.jpg"
    },
    {
      id: "15",
      title: "Hall of Fame (feat. will.i.am)",
      artist: "The Script",
      mood: "Energetic",
      duration: "1:43",
      youtubeUrl: "https://youtube.com/watch?v=snx5qGUtVi8",
      thumbnail: "https://i.ytimg.com/vi/snx5qGUtVi8/maxresdefault.jpg"
    },
    {
      id: "16",
      title: "I'm with You",
      artist: "Avril Lavigne",
      mood: "Sad",
      duration: "3:08",
      youtubeUrl: "https://youtube.com/watch?v=_qHWIvq_WR4",
      thumbnail: "https://i.ytimg.com/vi/_qHWIvq_WR4/maxresdefault.jpg"
    },
    {
      id: "17",
      title: "Nothing's Gonna Change My Love for You",
      artist: "George Benson",
      mood: "Relaxed",
      duration: "4:03",
      youtubeUrl: "https://youtube.com/watch?v=f1De87ETXwo",
      thumbnail: "https://i.ytimg.com/vi/f1De87ETXwo/maxresdefault.jpg"
    },
    {
      id: "18",
      title: "Hey Mama (feat. Afrojack, Bebe Rexha & Nicki Minaj)",
      artist: "David Guetta",
      mood: "Energetic",
      duration: "4:09",
      youtubeUrl: "https://youtube.com/watch?v=Hsz6hL_a69Q",
      thumbnail: "https://i.ytimg.com/vi/Hsz6hL_a69Q/maxresdefault.jpg"
    },
    {
      id: "19",
      title: "Stereo Hearts (feat. Adam Levine)",
      artist: "Gym Class Heroes",
      mood: "Happy",
      duration: "3:13",
      youtubeUrl: "https://youtube.com/watch?v=SiRJw4f_ufc",
      thumbnail: "https://i.ytimg.com/vi/SiRJw4f_ufc/maxresdefault.jpg"
    },
    {
      id: "20",
      title: "Live While We're Young",
      artist: "One Direction",
      mood: "Energetic",
      duration: "3:31",
      youtubeUrl: "https://youtube.com/watch?v=blCNvso3UDU",
      thumbnail: "https://i.ytimg.com/vi/blCNvso3UDU/maxresdefault.jpg"
    },
    {
      id: "21",
      title: "Glad You Came",
      artist: "The Wanted",
      mood: "Energetic",
      duration: "3:21",
      youtubeUrl: "https://youtube.com/watch?v=XsMvL1uvl_o",
      thumbnail: "https://i.ytimg.com/vi/XsMvL1uvl_o/maxresdefault.jpg"
    },
    {
      id: "22",
      title: "Don't Look Back in Anger",
      artist: "Oasis",
      mood: "Chill",
      duration: "3:19",
      youtubeUrl: "https://youtube.com/watch?v=X59TlszGtfM",
      thumbnail: "https://i.ytimg.com/vi/X59TlszGtfM/maxresdefault.jpg"
    },
    {
      id: "23",
      title: "Steal My Girl",
      artist: "One Direction",
      mood: "Happy",
      duration: "4:50",
      youtubeUrl: "https://youtube.com/watch?v=gnN_jiesIkM",
      thumbnail: "https://i.ytimg.com/vi/gnN_jiesIkM/maxresdefault.jpg"
    },
    {
      id: "24",
      title: "In the End",
      artist: "Linkin Park",
      mood: "Angry",
      duration: "3:49",
      youtubeUrl: "https://youtube.com/watch?v=BLZWkjBXfN8",
      thumbnail: "https://i.ytimg.com/vi/BLZWkjBXfN8/maxresdefault.jpg"
    },
    {
      id: "25",
      title: "Yellow",
      artist: "Coldplay",
      mood: "Chill",
      duration: "3:37",
      youtubeUrl: "https://youtube.com/watch?v=9qnqYL0eNNI",
      thumbnail: "https://i.ytimg.com/vi/9qnqYL0eNNI/maxresdefault.jpg"
    },
    {
      id: "26",
      title: "Hinahanap-Hanap Kita",
      artist: "Rivermaya",
      mood: "Sad",
      duration: "3:38",
      youtubeUrl: "https://youtube.com/watch?v=JsjzVo2pAnc",
      thumbnail: "https://i.ytimg.com/vi/JsjzVo2pAnc/maxresdefault.jpg"
    },
    {
      id: "27",
      title: "Kisapmata",
      artist: "Rivermaya",
      mood: "Angry",
      duration: "5:59",
      youtubeUrl: "https://youtube.com/watch?v=XZvTk1WItqE",
      thumbnail: "https://i.ytimg.com/vi/XZvTk1WItqE/maxresdefault.jpg"
    },
    {
      id: "28",
      title: "Sorry, Blame It On Me",
      artist: "Akon",
      mood: "Sad",
      duration: "4:41",
      youtubeUrl: "https://youtube.com/watch?v=km1dvRb6sZs",
      thumbnail: "https://i.ytimg.com/vi/km1dvRb6sZs/maxresdefault.jpg"
    },
    {
      id: "29",
      title: "Thank You",
      artist: "Dido",
      mood: "Relaxed",
      duration: "4:56",
      youtubeUrl: "https://youtube.com/watch?v=Yj8ZufvGfvk",
      thumbnail: "https://i.ytimg.com/vi/Yj8ZufvGfvk/maxresdefault.jpg"
    },
    {
      id: "30",
      title: "Toxic",
      artist: "Britney Spears",
      mood: "Energetic",
      duration: "5:25",
      youtubeUrl: "https://youtube.com/watch?v=tVdr_JWmnsA",
      thumbnail: "https://i.ytimg.com/vi/tVdr_JWmnsA/maxresdefault.jpg"
    },
    {
      id: "31",
      title: "Till I Collapse (feat. Nate Dogg)",
      artist: "Eminem",
      mood: "Focus",
      duration: "3:29",
      youtubeUrl: "https://youtube.com/watch?v=Obim8BYGnOE",
      thumbnail: "https://i.ytimg.com/vi/Obim8BYGnOE/maxresdefault.jpg"
    },
    {
      id: "32",
      title: "Elesi",
      artist: "Rivermaya",
      mood: "Sad",
      duration: "4:58",
      youtubeUrl: "https://youtube.com/watch?v=12eR72YJM64",
      thumbnail: "https://i.ytimg.com/vi/12eR72YJM64/maxresdefault.jpg"
    },
    {
      id: "33",
      title: "214",
      artist: "Rivermaya",
      mood: "Sad",
      duration: "4:59",
      youtubeUrl: "https://youtube.com/watch?v=6yrmsZgW3RE",
      thumbnail: "https://i.ytimg.com/vi/6yrmsZgW3RE/maxresdefault.jpg"
    },
    {
      id: "34",
      title: "Treasure",
      artist: "Bruno Mars",
      mood: "Energetic",
      duration: "4:34",
      youtubeUrl: "https://youtube.com/watch?v=cy6Arnjp-hQ",
      thumbnail: "https://i.ytimg.com/vi/cy6Arnjp-hQ/maxresdefault.jpg"
    },
    {
      id: "35",
      title: "Call Me Maybe",
      artist: "Carly Rae Jepsen",
      mood: "Happy",
      duration: "2:46",
      youtubeUrl: "https://youtube.com/watch?v=dlObDivWgx8",
      thumbnail: "https://i.ytimg.com/vi/dlObDivWgx8/maxresdefault.jpg"
    },
    {
      id: "36",
      title: "Don't Matter",
      artist: "Akon",
      mood: "Energetic",
      duration: "3:14",
      youtubeUrl: "https://youtube.com/watch?v=oadfmOPGjOY",
      thumbnail: "https://i.ytimg.com/vi/oadfmOPGjOY/maxresdefault.jpg"
    },
    {
      id: "37",
      title: "Lover (Remix) (feat. Shawn Mendes)",
      artist: "Taylor Swift",
      mood: "Happy",
      duration: "2:25",
      youtubeUrl: "https://youtube.com/watch?v=GCEljC8gZbU",
      thumbnail: "https://i.ytimg.com/vi/GCEljC8gZbU/maxresdefault.jpg"
    },
    {
      id: "38",
      title: "Tuwing Umuulan at Kapiling Ka",
      artist: "Basil Valdez",
      mood: "Relaxed",
      duration: "3:42",
      youtubeUrl: "https://youtube.com/watch?v=a8GyUhTFx4k",
      thumbnail: "https://i.ytimg.com/vi/a8GyUhTFx4k/maxresdefault.jpg"
    },
    {
      id: "39",
      title: "Alapaap",
      artist: "Eraserheads",
      mood: "Chill",
      duration: "5:01",
      youtubeUrl: "https://youtube.com/watch?v=-CJyexGXKK0",
      thumbnail: "https://i.ytimg.com/vi/-CJyexGXKK0/maxresdefault.jpg"
    },
    {
      id: "40",
      title: "Magasin",
      artist: "Eraserheads",
      mood: "Chill",
      duration: "4:23",
      youtubeUrl: "https://youtube.com/watch?v=LYtAEgCbxJ4",
      thumbnail: "https://i.ytimg.com/vi/LYtAEgCbxJ4/maxresdefault.jpg"
    },
    {
      id: "41",
      title: "Ligaya",
      artist: "Eraserheads",
      mood: "Happy",
      duration: "4:09",
      youtubeUrl: "https://youtube.com/watch?v=XI_H2wY9VHo",
      thumbnail: "https://i.ytimg.com/vi/XI_H2wY9VHo/maxresdefault.jpg"
    },
    {
      id: "42",
      title: "Buko",
      artist: "Jireh Lim",
      mood: "Relaxed",
      duration: "4:30",
      youtubeUrl: "https://youtube.com/watch?v=URR3FKn8NvU",
      thumbnail: "https://i.ytimg.com/vi/URR3FKn8NvU/maxresdefault.jpg"
    },
    {
      id: "43",
      title: "Kahit Walang Sabihin",
      artist: "Rico Blanco",
      mood: "Sad",
      duration: "5:13",
      youtubeUrl: "https://youtube.com/watch?v=UFZFkVcfJS8",
      thumbnail: "https://i.ytimg.com/vi/UFZFkVcfJS8/maxresdefault.jpg"
    },
    {
      id: "44",
      title: "Way down We Go",
      artist: "KALEO",
      mood: "Chill",
      duration: "4:48",
      youtubeUrl: "https://youtube.com/watch?v=YTCS7IWUJu8",
      thumbnail: "https://i.ytimg.com/vi/YTCS7IWUJu8/maxresdefault.jpg"
    },
    {
      id: "45",
      title: "We Don't Talk Anymore (feat. Selena Gomez)",
      artist: "Charlie Puth",
      mood: "Sad",
      duration: "3:34",
      youtubeUrl: "https://youtube.com/watch?v=ffqliB42Nh4",
      thumbnail: "https://i.ytimg.com/vi/ffqliB42Nh4/maxresdefault.jpg"
    },
    {
      id: "46",
      title: "It's Gonna Be Me",
      artist: "*NSYNC",
      mood: "Energetic",
      duration: "3:16",
      youtubeUrl: "https://youtube.com/watch?v=dyDBxOiR4dc",
      thumbnail: "https://i.ytimg.com/vi/dyDBxOiR4dc/maxresdefault.jpg"
    },
    {
      id: "47",
      title: "As Long as You Love Me",
      artist: "Backstreet Boys",
      mood: "Happy",
      duration: "3:13",
      youtubeUrl: "https://youtube.com/watch?v=960wzRtcl-Y",
      thumbnail: "https://i.ytimg.com/vi/960wzRtcl-Y/maxresdefault.jpg"
    },
    {
      id: "48",
      title: "Iris",
      artist: "Goo Goo Dolls",
      mood: "Sad",
      duration: "3:33",
      youtubeUrl: "https://youtube.com/watch?v=Dy_eP-mqWow",
      thumbnail: "https://i.ytimg.com/vi/Dy_eP-mqWow/maxresdefault.jpg"
    },
    {
      id: "49",
      title: "Even the Nights Are Better",
      artist: "Air Supply",
      mood: "Relaxed",
      duration: "4:50",
      youtubeUrl: "https://youtube.com/watch?v=2fSBjXnhwSw",
      thumbnail: "https://i.ytimg.com/vi/2fSBjXnhwSw/maxresdefault.jpg"
    },
    {
      id: "50",
      title: "YMCA (Original Version 1978)",
      artist: "Village People",
      mood: "Energetic",
      duration: "4:05",
      youtubeUrl: "https://youtube.com/watch?v=RN8Li7kYNnw",
      thumbnail: "https://i.ytimg.com/vi/RN8Li7kYNnw/maxresdefault.jpg"
    },
    {
      id: "51",
      title: "Do You Remember (feat. Sean Paul & Lil Jon)",
      artist: "Jay Sean",
      mood: "Energetic",
      duration: "4:10",
      youtubeUrl: "https://youtube.com/watch?v=9LvgomJNXkg",
      thumbnail: "https://i.ytimg.com/vi/9LvgomJNXkg/maxresdefault.jpg"
    },
    {
      id: "52",
      title: "Down (feat. Lil Wayne)",
      artist: "Jay Sean",
      mood: "Energetic",
      duration: "3:31",
      youtubeUrl: "https://youtube.com/watch?v=DQ514qIthSc",
      thumbnail: "https://i.ytimg.com/vi/DQ514qIthSc/maxresdefault.jpg"
    },
    {
      id: "53",
      title: "Night Changes",
      artist: "One Direction",
      mood: "Chill",
      duration: "3:33",
      youtubeUrl: "https://youtube.com/watch?v=8BiLurrzFRw",
      thumbnail: "https://i.ytimg.com/vi/8BiLurrzFRw/maxresdefault.jpg"
    },
    {
      id: "54",
      title: "Lose Yourself",
      artist: "Eminem",
      mood: "Focus",
      duration: "2:13",
      youtubeUrl: "https://youtube.com/watch?v=4wOLVrGHiIU",
      thumbnail: "https://i.ytimg.com/vi/4wOLVrGHiIU/maxresdefault.jpg"
    },
    {
      id: "55",
      title: "Time",
      artist: "Hans Zimmer",
      mood: "Focus",
      duration: "3:02",
      youtubeUrl: "https://youtube.com/watch?v=jgyShFzdB_Q",
      thumbnail: "https://i.ytimg.com/vi/jgyShFzdB_Q/maxresdefault.jpg"
    },
    {
      id: "56",
      title: "Eye of the Tiger",
      artist: "Survivor",
      mood: "Energetic",
      duration: "4:50",
      youtubeUrl: "https://youtube.com/watch?v=S-LO6dctBms",
      thumbnail: "https://i.ytimg.com/vi/S-LO6dctBms/maxresdefault.jpg"
    },
    {
      id: "57",
      title: "I Think They Call This Love",
      artist: "Elliot James Reay",
      mood: "Relaxed",
      duration: "3:29",
      youtubeUrl: "https://youtube.com/watch?v=EAnLyHsc3-Y",
      thumbnail: "https://i.ytimg.com/vi/EAnLyHsc3-Y/maxresdefault.jpg"
    },
    {
      id: "58",
      title: "METAMORPHOSIS",
      artist: "INTERWORLD",
      mood: "Energetic",
      duration: "3:14",
      youtubeUrl: "https://youtube.com/watch?v=lJvRohYSrZM",
      thumbnail: "https://i.ytimg.com/vi/lJvRohYSrZM/maxresdefault.jpg"
    },
    {
      id: "59",
      title: "Skyfall",
      artist: "Adele",
      mood: "Sad",
      duration: "2:05",
      youtubeUrl: "https://youtube.com/watch?v=LJzp_mDxaT0",
      thumbnail: "https://i.ytimg.com/vi/LJzp_mDxaT0/maxresdefault.jpg"
    },
    {
      id: "60",
      title: "Teenage Dirtbag",
      artist: "Wheatus",
      mood: "Angry",
      duration: "4:47",
      youtubeUrl: "https://youtube.com/watch?v=dSlYFtXENPo",
      thumbnail: "https://i.ytimg.com/vi/dSlYFtXENPo/maxresdefault.jpg"
    },
    {
      id: "61",
      title: "Bloody Mary",
      artist: "Lady Gaga",
      mood: "Energetic",
      duration: "4:02",
      youtubeUrl: "https://youtube.com/watch?v=1e32cgJrbBo",
      thumbnail: "https://i.ytimg.com/vi/1e32cgJrbBo/maxresdefault.jpg"
    },
    {
      id: "62",
      title: "Love Story",
      artist: "Indila",
      mood: "Relaxed",
      duration: "4:05",
      youtubeUrl: "https://youtube.com/watch?v=4TIGwaBHuzg",
      thumbnail: "https://i.ytimg.com/vi/4TIGwaBHuzg/maxresdefault.jpg"
    }
  ];

  const filteredSongs = songs.filter(song => {
    const matchesMood = selectedMood === "All" || song.mood === selectedMood;
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMood && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Mood-Based Music</h1>
            <p className="text-lg text-muted-foreground">
              Let Mr Sarcastic suggest the perfect soundtrack for your current vibe
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search songs or artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {moods.map((mood) => (
                <Button
                  key={mood}
                  variant={selectedMood === mood ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMood(mood)}
                  className="text-xs"
                >
                  {mood}
                </Button>
              ))}
            </div>
          </div>

          {/* Songs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song) => (
              <Card key={song.id} className="group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
                <div className="p-4">
                  <div className="aspect-video bg-muted rounded-lg mb-4 relative overflow-hidden">
                    <img 
                      src={song.thumbnail} 
                      alt={song.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://i.ytimg.com/vi/${extractVideoId(song.youtubeUrl)}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-full"
                        onClick={() => playVideo(song)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{song.title}</h3>
                        <p className="text-xs text-muted-foreground">{song.artist}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                        <Heart className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {song.mood}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{song.duration}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          YouTube
                        </a>
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => playVideo(song)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredSongs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No songs found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSelectedMood("All");
                  setSearchTerm("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* YouTube Player Modal */}
        <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl">
                    {currentSong?.title}
                  </DialogTitle>
                  <p className="text-muted-foreground">
                    by {currentSong?.artist}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{currentSong?.mood}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closePlayer}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            {currentSong && (
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractVideoId(currentSong.youtubeUrl)}?autoplay=1&rel=0`}
                  title={currentSong.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={currentSong?.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in YouTube
                  </a>
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="w-3 h-3 mr-1" />
                  Add to Favorites
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Duration: {currentSong?.duration}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Songs;