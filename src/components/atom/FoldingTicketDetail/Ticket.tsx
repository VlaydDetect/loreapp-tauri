import React, {useState} from 'react';

const Flight = [
    {
        image: "",
        style: {
            height: "51px",
            margin: "22px 12px"
        },
        label: "rgb(13, 28, 83)"
    },
    {
        image: "",
        style: {
            height: "26px",
            margin: "34px 16px"
        },
        label: "rgb(90, 5, 49)"
    },
    {
        image: "",
        style: {
            height: "23px",
            margin: "41px 12px"
        },
        label: "rgb(230, 26, 56)"
    },
    {
        image: "",
        style: {
            height: "46px",
            margin: "22px 15px"
        },
        label: "rgb(252, 178, 50)"
    },
    {
        image: "",
        style: {
            height: "51px",
            margin: "22px 12px"
        },
        label: "rgb(13, 28, 83)"
    },
    {
        image: "",
        style: {
            height: "26px",
            margin: "34px 16px"
        },
        label: "rgb(90, 5, 49)"
    },
    {
        image: "",
        style: {
            height: "23px",
            margin: "41px 12px"
        },
        label: "rgb(230, 26, 56)"
    },
    {
        image: "",
        style: {
            height: "46px",
            margin: "22px 15px"
        },
        label: "rgb(252, 178, 50)"
    }
];

const Cell = ({index}: {index: number}) => {
    const [active, handleActive] = useState(false);

    return (
        <div
            id="cardContainer"
            style={{
                height: active ? `300px` : `100px`,
                transition: "0.9s"
            }}
            onClick={() => {
                handleActive(!active);
            }}
        >
            <div id="firstDisplay">
                <div id="flightDetail">
                    <div
                        id="detailLabel"
                        style={{ fontWeight: "bold", color: Flight[index].label }}
                    >
                        From
                    </div>
                    BLR
                    <div id="detailLabel">Kempegowda International</div>
                </div>
                <div
                    id="flightDetail"
                    style={{
                        marginTop: "15px"
                    }}
                >
                    <div id="animContainer">
                        <div id="anim">
                            <div id="circle" />
                            <div id="circle" />
                            <div id="circle" />
                        </div>
                    </div>
                    <div id="animContainer" style={{ left: "62px" }}>
                        <div id="anim">
                            <div id="circle" />
                            <div id="circle" />
                            <div id="circle" />
                        </div>
                    </div>
                    <img
                        style={{ width: "30px" }}
                        src="https://github.com/pizza3/asset/blob/master/airplane2.png?raw=true"
                    />
                </div>
                <div id="flightDetail">
                    <div
                        id="detailLabel"
                        style={{ fontWeight: "bold", color: Flight[index].label }}
                    >
                        To
                    </div>
                    DEL
                    <div id="detailLabel">Indira Gandhi International</div>
                </div>
            </div>
            <div
                id="first"
                style={{
                    transform: active
                        ? `rotate3d(1, 0, 0, -180deg)`
                        : `rotate3d(1, 0, 0, 0deg)`,
                    transitionDelay: active ? "0s" : "0.3s"
                }}
            >
                <div id="firstTop">
                    <img style={Flight[index].style} src={Flight[index].image} />
                    <div id="timecontainer">
                        <div id="detailDate">
                            Bengaluru
                            <div id="detailTime">6:20</div>
                            June 12
                        </div>
                        <img
                            style={{
                                width: "30px",
                                height: "26px",
                                marginTop: "22px",
                                marginLeft: "16px",
                                marginRight: "16px"
                            }}
                            src="https://github.com/pizza3/asset/blob/master/airplane2.png?raw=true"
                        />
                        <div id="detailDate">
                            New Delhi
                            <div id="detailTime">8:45</div>
                            June 12
                        </div>
                    </div>
                </div>
                <div id="firstBehind">
                    <div id="firstBehindDisplay">
                        <div id="firstBehindRow">
                            <div id="detail">
                                6:20 - 8:45
                                <div id="detailLabel">Flight Time</div>
                            </div>
                            <div id="detail">
                                No
                                <div id="detailLabel">Transfer</div>
                            </div>
                        </div>
                        <div id="firstBehindRow">
                            <div id="detail">
                                2h 25 min
                                <div id="detailLabel">Duration</div>
                            </div>
                            <div id="detail">
                                8<div id="detailLabel">Gate</div>
                            </div>
                        </div>
                        <div id="firstBehindRow">
                            <div id="detail">
                                5:35
                                <div id="detailLabel">Boarding</div>
                            </div>
                            <div id="detail">
                                20A
                                <div id="detailLabel">Seat</div>
                            </div>
                        </div>
                    </div>
                    <div
                        id="second"
                        style={{
                            transform: active
                                ? `rotate3d(1, 0, 0, -180deg)`
                                : `rotate3d(1, 0, 0, 0deg)`,
                            transitionDelay: active ? "0.2s" : "0.2s"
                        }}
                    >
                        <div id="secondTop" />
                        <div id="secondBehind">
                            <div id="secondBehindDisplay">
                                <div id="price">
                                    $100
                                    <div id="priceLabel">Price</div>
                                </div>
                                <div id="price">
                                    Economy
                                    <div id="priceLabel">Class</div>
                                </div>
                                <img
                                    id="barCode"
                                    src="https://github.com/pizza3/asset/blob/master/barcode.png?raw=true"
                                />
                            </div>
                            <div
                                id="third"
                                style={{
                                    transform: active
                                        ? `rotate3d(1, 0, 0, -180deg)`
                                        : `rotate3d(1, 0, 0, 0deg)`,
                                    transitionDelay: active ? "0.4s" : "0s"
                                }}
                            >
                                <div id="thirdTop" />
                                <div id="secondBehindBottom">
                                    <button
                                        id="button"
                                        style={{
                                            color: Flight[index].label,
                                            border: `1px solid ${Flight[index].label}`
                                        }}
                                    >
                                        Pay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Header = (
    <div>
        <svg
            id="back"
            xmlns="http://www.w3.org/2000/svg"
            width="512"
            height="512"
            viewBox="0 0 512 512"
        >
            <polyline
                points="244 400 100 256 244 112"
                style={{
                    fill: "none",
                    stroke: "#000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "48px"
                }}
            />
            <line
                x1="120"
                y1="256"
                x2="412"
                y2="256"
                style={{
                    fill: "none",
                    stroke: "#000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "48px"
                }}
            />
        </svg>
        <div id="headerText">Select Flight</div>
        <div id="tripDetail">
            Your Trip
            <div id="tripDest">
                BLR - DEL<div id="oneWay">One Way</div>
                <div />
            </div>
            12th June, 2020
        </div>
        <svg
            id="settings"
            xmlns="http://www.w3.org/2000/svg"
            width="512"
            height="512"
            viewBox="0 0 512 512"
        >
            <line
                x1="368"
                y1="128"
                x2="448"
                y2="128"
                style={{
                    fill: "none",
                    stroke: "#000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "32px"
                }}
            />
            <line
                x1="64"
                y1="128"
                x2="304"
                y2="128"
                style={{
                    fill: "none",
                    stroke: "#000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "32px"
                }}
            />
            <line
                x1="368"
                y1="384"
                x2="448"
                y2="384"
                style={{
                    fill: "none",
                    stroke: "#000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "32px"
                }}
            />
            <line
                x1="64"
                y1="384"
                x2="304"
                y2="384"
                style={{
                    fill: "none",
                    stroke: "#000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "32px"
                }}
            />
            <line
                x1="208"
                y1="256"
                x2="448"
                y2="256"
                style={{
                    fill: "none",
                    stroke: "#000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "32px"
                }}
            />
            <line
                x1="64"
                y1="256"
                x2="144"
                y2="256"
                style={{
                    fill: "none",
                    stroke: "#000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "32px"
                }}
            />
            <circle
                cx="336"
                cy="128"
                r="32"
                style={{
                    fill: "none",
                    stroke: "#000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "32px"
                }}
            />
            <circle
                cx="176"
                cy="256"
                r="32"
                style={{
                    fill: "none",
                    stroke: "#000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "32px"
                }}
            />
            <circle
                cx="336"
                cy="384"
                r="32"
                style={{
                    fill: "none",
                    stroke: "#000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "32px"
                }}
            />
        </svg>
    </div>
);

const DataArr = Array(8).fill(0).map(Number.call, Number);
const Ticket = () => {
    return (
        <div>
            {Header}
            {DataArr.map((val, i) => (
                <Cell key={i} index={i} />
            ))}
        </div>
    );
}
