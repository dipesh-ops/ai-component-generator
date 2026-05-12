import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Editor from '@monaco-editor/react';
import { GoogleGenAI } from "@google/genai";
import Select from 'react-select';
import { IoCodeSlashOutline, IoCopy, IoSparklesSharp } from 'react-icons/io5'
import { FaFreeCodeCamp, FaRegEye } from 'react-icons/fa'
import { MdOutlineIosShare } from 'react-icons/md'
import { TfiNewWindow } from 'react-icons/tfi';
import { LuRefreshCcw } from 'react-icons/lu';
import { RingLoader } from 'react-spinners';

const Home = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [outputScreen, setOutputScreen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [code, setCode] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const options = [
        { value: 'html-css', label: 'HTML + CSS' },
        { value: 'html-tailwind', label: 'HTML + TAILWIND' },
        { value: 'html-bootstrap', label: 'HTML + BOOTSTRAP' },
        { value: 'html-css-js', label: 'HTML + CSS + JS' },
    ];
    const [framework, setFramework] = useState(options[0]);

    function extractCode(response) {
        const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
        return match ? match[1].trim() : response.trim();
    }

    const ai = new GoogleGenAI({ apiKey: "AIzaSyDyC1cnjrqSSZc-7prVEGrtNqKyJUA0y-w" });

    const getResponseFromAPI = async () => {
        if (!prompt.trim()) return;
        
        setIsGenerating(true);
        try {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `
                    You are an experienced programmer with expertise in web development and UI/UX design. You create modern, animated, and fully responsive UI components. You are highly skilled in HTML, CSS, Tailwind CSS, Bootstrap, JavaScript, React, Next.js, Vue.js, Angular, and more.

                    Now, generate a UI component for: ${prompt}  
                    Framework to use: ${framework.value}  

                    Requirements:  
                    - The code must be clean, well-structured, and easy to understand.  
                    - Optimize for SEO where applicable.  
                    - Focus on creating a modern, animated, and responsive UI design.  
                    - Include high-quality hover effects, shadows, animations, colors, and typography.  
                    - Return ONLY the code, formatted properly in **Markdown fenced code blocks**.  
                    - Do NOT include explanations, text, comments, or anything else besides the code.  
                    - And give the whole code in a single HTML file.
                `,
            });
            setCode(extractCode(response.text));
            setOutputScreen(true)
        } catch (error) {
            console.error('Error generating code:', error);
        } finally {
            setIsGenerating(false);
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }

    const downloadFile = () => {
        if (!code.trim()) return;
        const fileName = "AI-Code-generator.html";
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    const openInNewTab = () => {
        if (!code.trim()) return;
        const newWindow = window.open();
        newWindow.document.write(code);
        newWindow.document.close();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Section - Input */}
                    <div className="lg:w-2/5">
                        <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                                Component Generator
                            </h1>
                            <p className="text-gray-400 text-sm mb-4 ml-1">
                                Describe Your Component Below...!
                            </p>

                            <div className="mb-4">
                                <Select
                                    value={framework}
                                    onChange={(selected) => setFramework(selected)}
                                    options={options}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: '#8b5cf6',
                                            primary75: '#a78bfa',
                                            primary50: '#c4b5fd',
                                            primary25: '#ede9fe',
                                            neutral0: '#1f2937',
                                            neutral10: '#374151',
                                            neutral20: '#4b5563',
                                            neutral30: '#6b7280',
                                            neutral80: '#f3f4f6',
                                        },
                                    })}
                                />
                            </div>

                            <div className="relative">
                                <textarea 
                                    onChange={(e) => setPrompt(e.target.value)} 
                                    rows={8} 
                                    className="w-full min-h-[300px] rounded-lg bg-gray-900 text-white p-4 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none resize-y font-mono text-sm"
                                    placeholder="Describe your component and AI will create your component... Example: 'Create a modern login form with email and password fields, floating labels, and a submit button'"
                                    value={prompt}
                                />
                                <button 
                                    onClick={getResponseFromAPI} 
                                    className={`absolute bottom-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                                        isGenerating || !prompt.trim() ? 'opacity-50 cursor-not-allowed hover:scale-100' : 'cursor-pointer'
                                    }`}
                                    disabled={isGenerating || !prompt.trim()}
                                >
                                    {!isGenerating ? <IoSparklesSharp className="text-lg" /> : <RingLoader size={20} className='text-white'/>}
                                    {isGenerating ? 'Generating...' : 'Generate'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Output */}
                    <div className="lg:w-3/5">
                        <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 flex flex-col h-[85vh]">
                            {outputScreen === true ? (
                                <>
                                    {/* Tabs */}
                                    <div className="flex gap-2 p-4 border-b border-gray-700">
                                        <button 
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                                activeTab === 1 
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                            onClick={() => setActiveTab(1)}
                                        >
                                            <IoCodeSlashOutline className="text-lg" />
                                            Code Editor
                                        </button>
                                        <button 
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                                activeTab === 2 
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                            onClick={() => setActiveTab(2)}
                                        >
                                            <FaRegEye className="text-lg" />
                                            Live Preview
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col overflow-hidden">
                                        {activeTab === 1 ? (
                                            <>
                                                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                                                    <h1 className="text-white font-semibold">Code Editor</h1>
                                                    <div className="flex gap-3">
                                                        <button 
                                                            onClick={downloadFile} 
                                                            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all duration-200 cursor-pointer"
                                                            title="Download"
                                                        >
                                                            <MdOutlineIosShare className="text-xl" />
                                                        </button>
                                                        <div className="relative">
                                                            <button 
                                                                onClick={handleCopy} 
                                                                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all duration-200 cursor-pointer"
                                                                title="Copy"
                                                            >
                                                                <IoCopy className="text-xl" />
                                                            </button>
                                                            {isCopied && (
                                                                <span className="absolute top-7 right-5 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                                                    Copied!
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <Editor 
                                                        value={code} 
                                                        theme='vs-dark' 
                                                        height="100%"
                                                        defaultLanguage="html" 
                                                        defaultValue="// Your generated code will appear here"
                                                        options={{
                                                            minimap: { enabled: false },
                                                            fontSize: 14,
                                                            wordWrap: 'on',
                                                            automaticLayout: true,
                                                            scrollBeyondLastLine: false,
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                                                    <h1 className="text-white font-semibold">Live Preview</h1>
                                                    <div className="flex gap-3">
                                                        <button 
                                                            onClick={openInNewTab} 
                                                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm"
                                                        >
                                                            <TfiNewWindow />
                                                            Open in New Tab
                                                        </button>
                                                        <button 
                                                            onClick={()=> setRefreshKey(prev => prev + 1)} 
                                                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm"
                                                        >
                                                            <LuRefreshCcw />
                                                            Refresh
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-4 bg-gray-900">
                                                    {code ? (
                                                        <iframe 
                                                            className="w-full h-full rounded-lg border border-gray-700 bg-white"
                                                            srcDoc={code}
                                                            title="Live Preview"
                                                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                            <FaFreeCodeCamp className="text-6xl mb-4 opacity-50" />
                                                            <p>Generate some code to see live preview</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-y-3 items-center justify-center h-full">
                                    <FaFreeCodeCamp className="text-8xl font-semibold bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-full text-gray-800 shadow-2xl" />
                                    <h1 className='text-lg text-gray-500'>Your code and component will appear here...</h1>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;