import { useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Link } from "@inertiajs/react";

export default function NoticeQueryModal({
    notices,
    isOpen,
    onClose,
    isAdmin = false,
    onDelete = () => {},
}) {
    const [search, setSearch] = useState("");
    const [filterYear, setFilterYear] = useState("all");
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchScope, setSearchScope] = useState("title");
    const pageSize = 5;

    const modalRef = useRef(null);
    const controls = useAnimation();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            setSelectedNotice(null);
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        if (selectedNotice) {
            controls.set({ x: 0 });

            const timer = setTimeout(() => {
                controls.start({
                    x: [-2, 2, -2, 2, -2, 2],
                    transition: {
                        duration: 1.2,
                        ease: "easeInOut",
                    },
                });
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [selectedNotice, controls]);

    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    const filtered = useMemo(() => {
        return notices.filter((notice) => {
            const year = new Date(notice.created_at).getFullYear().toString();
            const inTitle = notice.title.includes(search);
            const inContent = notice.content.includes(search);
            const matchSearch =
                searchScope === "all" ? inTitle || inContent : inTitle;
            return matchSearch && (filterYear === "all" || year === filterYear);
        });
    }, [search, searchScope, filterYear, notices]);

    const yearOptions = useMemo(
        () =>
            Array.from(
                new Set(
                    notices.map((n) =>
                        new Date(n.created_at).getFullYear().toString()
                    )
                )
            ),
        [notices]
    );

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginatedNotices = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={handleBackdropClick}
                >
                    <motion.div
                        layout
                        ref={modalRef}
                        className="relative bg-white dark:bg-zinc-800 p-6 rounded-lg max-w-3xl w-full z-10 overflow-auto max-h-[90vh]"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                    >
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                            onClick={onClose}
                        >
                            &times;
                        </button>

                        <h2 className="text-2xl font-bold mb-4 text-indigo-700 text-center">
                            公告查詢
                        </h2>

                        {!selectedNotice && (
                            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="輸入關鍵字搜尋"
                                    className="flex-1 p-2 border rounded"
                                />

                                <select
                                    value={searchScope}
                                    onChange={(e) => {
                                        setSearchScope(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-36 p-2 border rounded"
                                >
                                    <option value="title">標題</option>
                                    <option value="all">包含內文</option>
                                </select>

                                <select
                                    value={filterYear}
                                    onChange={(e) => {
                                        setFilterYear(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-32 p-2 border rounded"
                                >
                                    <option value="all">全部年份</option>
                                    {yearOptions.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {isAdmin && selectedNotice && (
                            <div className="flex gap-2 mt-4">
                                <Link
                                    href={route(
                                        "notices.edit",
                                        selectedNotice.id
                                    )}
                                    className="bg-yellow-400 text-white px-3 py-1 rounded"
                                >
                                    編輯
                                </Link>
                                <button
                                    onClick={() => onDelete(selectedNotice.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    刪除
                                </button>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {selectedNotice ? (
                                <motion.div
                                    key="detail"
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-yellow-100 dark:bg-zinc-700 p-4 rounded shadow"
                                >
                                    <h3 className="text-xl font-bold mb-2 text-zinc-800 dark:text-white">
                                        {selectedNotice.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                                        發布日期：
                                        {new Date(
                                            selectedNotice.created_at
                                        ).toLocaleDateString()}
                                    </p>
                                    <p className="text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap">
                                        {selectedNotice.content}
                                    </p>
                                    <motion.button
                                        onClick={() => setSelectedNotice(null)}
                                        className="mt-6 text-sm text-indigo-600 flex items-center gap-1"
                                        animate={controls}
                                        whileHover={{
                                            scale: 1.05,
                                            transition: {
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20,
                                            },
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span className="text-lg">←</span>
                                        <span className="hover:underline">
                                            返回公告列表
                                        </span>
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <>
                                    <motion.ul
                                        key="list"
                                        layout
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                        }}
                                        className="space-y-2"
                                    >
                                        {paginatedNotices.map((notice) => (
                                            <motion.li
                                                layout
                                                key={notice.id}
                                                className="bg-yellow-100 dark:bg-zinc-700 p-4 rounded cursor-pointer hover:bg-yellow-200 dark:hover:bg-zinc-600"
                                                onClick={() =>
                                                    setSelectedNotice(notice)
                                                }
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{
                                                    duration: 0.3,
                                                    ease: "easeOut",
                                                }}
                                                whileHover={{
                                                    scale: 1.05,
                                                    boxShadow:
                                                        "0 6px 24px rgba(0,0,0,0.15)",
                                                    transition: {
                                                        type: "spring",
                                                        stiffness: 300,
                                                        damping: 18,
                                                    },
                                                }}
                                                whileTap={{ scale: 0.96 }}
                                            >
                                                <h3 className="text-zinc-700 font-semibold text-base dark:text-white hover:underline">
                                                    {notice.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    發布日期：
                                                    {new Date(
                                                        notice.created_at
                                                    ).toLocaleDateString()}
                                                </p>
                                            </motion.li>
                                        ))}
                                    </motion.ul>

                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-4">
                                            <button
                                                onClick={() =>
                                                    setCurrentPage((prev) =>
                                                        Math.max(prev - 1, 1)
                                                    )
                                                }
                                                disabled={currentPage === 1}
                                                className={`px-3 py-1 border rounded transition 
                                                ${
                                                    currentPage === 1
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "hover:bg-indigo-100"
                                                }`}
                                            >
                                                &lt;
                                            </button>

                                            {[...Array(totalPages)].map(
                                                (_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                i + 1
                                                            )
                                                        }
                                                        className={`px-3 py-1 border rounded transition 
                                                ${
                                                    i + 1 === currentPage
                                                        ? "bg-indigo-600 text-white"
                                                        : "hover:bg-indigo-100"
                                                }`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                )
                                            )}

                                            <button
                                                onClick={() =>
                                                    setCurrentPage((prev) =>
                                                        Math.min(
                                                            prev + 1,
                                                            totalPages
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    currentPage === totalPages
                                                }
                                                className={`px-3 py-1 border rounded transition 
                                                ${
                                                    currentPage === totalPages
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "hover:bg-indigo-100"
                                                }`}
                                            >
                                                &gt;
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
