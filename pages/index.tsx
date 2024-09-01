import type { NextPage } from "next";
import Head from "next/head";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import DropDown, { VibeType } from "@/components/DropDown";
import LoadingDots from "@/components/loading-dots/LoadingDots";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [generatedBios, setGeneratedBios] = useState<String>("");

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      bio: "",
      vibe: "Professional" as VibeType,
    },
  });

  const bioRef = useRef<null | HTMLDivElement>(null);

  const scrollToBios = () => {
    if (bioRef.current !== null) {
      bioRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const generateBio = async (data: { bio: string; vibe: VibeType }) => {
    const { bio, vibe } = data;

    const prompt = `Generate 4 ${
      vibe === "Casual"
        ? "relaxed"
        : vibe === "Funny"
        ? "silly"
        : "Professional"
    } linkedin job summary with no hashtags and clearly labeled "1.", "2.", "3." and "4.". Only return these 4 linkedin job summary, nothing else. ${
      vibe === "Funny" ? "Make the linkedin job summary humorous" : ""
    }Make sure each generated summary is less than 800 characters, has short sentences that are found in linkedin job summary, and feel free to use this context as well: ${bio}${
      bio.slice(-1) === "." ? "" : "."
    }`;

    setGeneratedBios("");
    setLoading(true);

    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const dataStream = response.body;
    if (!dataStream) return;

    const onParseGPT = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? "";
          setGeneratedBios((prev) => prev + text);
        } catch (e) {
          console.error(e);
        }
      }
    };

    const reader = dataStream.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParseGPT);
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }

    scrollToBios();
    setLoading(false);
  };

  const bioValue = watch("bio");

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      <Head>
        <title>Linkedin Summary Generator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-30 blur-3xl animate-pulse" />
        <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-30 blur-2xl animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center lg:mr-8 p-8 z-10">
        <h1 className="text-5xl font-extrabold text-white text-center mb-4 neon-text">
          LinkedIn Summary Generator
        </h1>
        <p className="text-lg text-gray-200 text-center mb-8">
          Generate professional LinkedIn summaries with ease.
        </p>

        <div className="mt-10 w-full">
          {generatedBios && (
            <>
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white neon-text">
                  Your Generated Summaries
                </h2>
                <p className="text-gray-300 mt-2">
                  Click to copy any summary to your clipboard.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                {generatedBios
                  .substring(generatedBios.indexOf("1") + 3)
                  .split(/2\.|3\./)
                  .map((generatedBio, index) => (
                    <div
                      key={index}
                      className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl shadow-lg p-6 text-white hover:bg-opacity-30 transition cursor-pointer border border-white border-opacity-10 neon-card"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedBio.trim());
                        toast("Summary copied to clipboard", {
                          icon: "✂️",
                          style: {
                            background: "#333",
                            color: "#fff",
                          },
                        });
                      }}
                    >
                      <p className="text-lg">{generatedBio.trim()}</p>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sidebar Form */}
      <aside className="lg:w-1/3 lg:sticky lg:top-0 lg:right-0 lg:h-screen lg:px-8 lg:py-16 bg-opacity-10 backdrop-blur-md bg-white border-l border-white border-opacity-20 z-20 p-8 lg:overflow-auto flex-shrink-0">
        <h2 className="text-2xl font-bold text-white mb-4 neon-text">
          Generate Summary
        </h2>
        <form
          onSubmit={handleSubmit(generateBio)}
          className="flex flex-col space-y-6"
        >
          <textarea
            {...register("bio", { required: true })}
            rows={3}
            className="w-full rounded-xl bg-white bg-opacity-20 border-none shadow-lg text-white placeholder-gray-400 p-4 focus:ring-2 focus:ring-purple-500"
            placeholder={"e.g. Software Developer"}
          />
          <DropDown
            vibe={watch("vibe")}
            setVibe={(newVibe) => setValue("vibe", newVibe)}
          />
          <button
            type="submit"
            className={`w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 neon-button ${
              !bioValue ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!bioValue || loading}
          >
            {loading ? (
              <LoadingDots color="white" style="large" />
            ) : (
              "Generate Summary &rarr;"
            )}
          </button>
        </form>
      </aside>

      {/* Toaster Notifications */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
    </div>
  );
};

export default Home;
