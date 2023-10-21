import React, {useRef} from 'react';
import './style.scss';

// https://codepen.io/nicolasjesenberger/details/KKGJgWr

export const TimeSlider = () => {
    const sliderWrapper = useRef<HTMLDivElement>(null);
    const sliderSvg = useRef<SVGSVGElement>(null);
    const sliderPath = useRef<SVGPathElement>(null);
    const sliderPathLength = sliderPath.current?.getTotalLength();
    const sliderThumb = useRef<HTMLDivElement>(null);
    const sliderInput = useRef<HTMLInputElement>(null);
    const sliderMinValue = Number(sliderInput.current?.min) || 0;
    const sliderMaxValue = Number(sliderInput.current?.max) || 100;

    const time = useRef<HTMLParagraphElement>(null);

    const updateTime = (timeInMinutes: number) => {
        let hours = Math.floor(timeInMinutes / 60);
        const minutes = timeInMinutes % 60;
        const isMorning = hours < 12;
        const formattedHours = String(isMorning ? hours || 12 : (hours - 12 || 12)).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        if (time.current) {
            time.current.textContent = `${formattedHours}:${formattedMinutes} ${isMorning || (hours === 24) ? 'AM' : 'PM'}`;
        }
    }

    const setColor = (progress: number) => {
        const colorStops = [
            { r: 243, g: 217, b: 112 },  // #F3D970
            { r: 252, g: 187, b: 93 },   // #FCBB5D
            { r: 246, g: 135, b: 109 },  // #F6876D
            { r: 147, g: 66, b: 132 },   // #934284
            { r: 64, g: 40, b: 98 },     // #402862
            { r: 1, g: 21, b: 73 }        // #011549
        ];

        const numStops = colorStops.length;

        const index = (numStops - 1) * progress;
        const startIndex = Math.floor(index);
        const endIndex = Math.ceil(index);

        const startColor = colorStops[startIndex];
        const endColor = colorStops[endIndex];

        const percentage = index - startIndex;

        const [r, g, b] = [Math.round(startColor.r + (endColor.r - startColor.r) * percentage), Math.round(startColor.g + (endColor.g - startColor.g) * percentage), Math.round(startColor.b + (endColor.b - startColor.b) * percentage)];

        sliderThumb.current?.style.setProperty('--color', `rgb(${r} ${g} ${b})`);
    }

    // updating position could be done with CSS Motion Path instead of absolute positioning but Safari <15.4 doesn’t seem to support it
    const updatePosition = (progress: number) => {
        if (sliderPath.current && sliderPathLength && sliderSvg.current && sliderThumb.current && sliderInput.current) {
            const point = sliderPath.current.getPointAtLength(progress * sliderPathLength);
            const svgRect = sliderSvg.current.getBoundingClientRect();

            const scaleX = svgRect.width / sliderSvg.current.viewBox.baseVal.width;
            const scaleY = svgRect.height / sliderSvg.current.viewBox.baseVal.height;
            sliderThumb.current.style.left = `${point.x * scaleX * 100 / svgRect.width}%`;
            sliderThumb.current.style.top = `${point.y * scaleY * 100 / svgRect.height}%`;
            const value = Math.round(progress * (sliderMaxValue - sliderMinValue));
            sliderInput.current.value = String(value);
            updateTime(value);
            setColor(progress);
        }
    };

    const handlePointerMove = (event: PointerEvent) => {
        if (sliderPath.current) {
            const sliderWidth = sliderPath.current.getBoundingClientRect().width;
            const pointerX = event.clientX - sliderPath.current.getBoundingClientRect().left;
            const progress = Math.min(Math.max(pointerX / sliderWidth, 0), 1);
            updatePosition(progress);
        }
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement> | React.PointerEvent<SVGPathElement>) => {
        if (sliderPath.current) {
            const sliderWidth = sliderPath.current.getBoundingClientRect().width;
            const pointerX = event.clientX - sliderPath.current.getBoundingClientRect().left;
            const progress = Math.min(Math.max(pointerX / sliderWidth, 0), 1);
            const isThumb = event.currentTarget.classList.contains('slider-thumb');
            if (!isThumb) updatePosition(progress);
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', () => {
                window.removeEventListener('pointermove', handlePointerMove);
            });
        }
    };

    if (sliderInput.current) {
        updatePosition(sliderInput.current.valueAsNumber / (sliderMaxValue - sliderMinValue));
    }

    return (
        <div ref={sliderWrapper} onSelect={e => e.preventDefault()} className="slider-wrapper">
            <input ref={sliderInput} className="slider-input" type="range" value="720" max="1440" step="1" onInput={() => {
                if (sliderInput.current) {
                    const progress = sliderInput.current.valueAsNumber / (sliderMaxValue - sliderMinValue);
                    updatePosition(progress);
                }
            }}/>
                <div ref={sliderThumb} className="slider-thumb" onPointerDown={handlePointerDown}>
                    <div className="slider-value-container">
                        <p ref={time} className="slider-value">12:00 PM</p>
                    </div>
                </div>
                <svg ref={sliderSvg} className="slider-svg" viewBox="0 0 238 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path ref={sliderPath} onPointerDown={handlePointerDown} className="slider-svg-path" d="M2 34L7.21879 31.0968C78.5901 -8.60616 165.659 -7.50128 236 34V34" stroke="url(#paint0_linear_339_100980)" strokeWidth=".25em" strokeLinecap="round" vectorEffect="non-scaling-stroke" filter="url(#filter0_i_339_100980)"/>
                    <defs>
                        <filter id="filter0_i_339_100980" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dy="1"/>
                            <feGaussianBlur stdDeviation="0.5"/>
                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_339_100980"/>
                        </filter>
                        <linearGradient id="paint0_linear_339_100980" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#F3D970"/>
                            <stop offset="0.2" stopColor="#FCBB5D"/>
                            <stop offset="0.4" stopColor="#F6876D"/>
                            <stop offset="0.6" stopColor="#934284"/>
                            <stop offset="0.8" stopColor="#402862"/>
                            <stop offset="1" stopColor="#011549"/>
                        </linearGradient>
                    </defs>
                </svg>
        </div>
    );
};
