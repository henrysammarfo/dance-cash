"use client";

import { motion, useInView, useAnimation, Variant } from "framer-motion";
import { useEffect, useRef } from "react";

interface Props {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
    distance?: number;
    className?: string;
}

export const ScrollReveal = ({
    children,
    width = "fit-content",
    delay = 0,
    direction = "up",
    distance = 50,
    className = ""
}: Props) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const mainControls = useAnimation();

    useEffect(() => {
        if (isInView) {
            mainControls.start("visible");
        }
    }, [isInView, mainControls]);

    const getHiddenVariant = (): { x: number; y: number; opacity: number } => {
        switch (direction) {
            case "up": return { x: 0, y: distance, opacity: 0 };
            case "down": return { x: 0, y: -distance, opacity: 0 };
            case "left": return { x: distance, y: 0, opacity: 0 };
            case "right": return { x: -distance, y: 0, opacity: 0 };
            default: return { x: 0, y: distance, opacity: 0 };
        }
    };

    return (
        <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }} className={className}>
            <motion.div
                variants={{
                    hidden: getHiddenVariant(),
                    visible: { x: 0, y: 0, opacity: 1 },
                }}
                initial="hidden"
                animate={mainControls}
                transition={{ duration: 0.8, delay: delay, ease: [0.25, 0.25, 0.25, 0.75] }}
            >
                {children}
            </motion.div>
        </div>
    );
};
