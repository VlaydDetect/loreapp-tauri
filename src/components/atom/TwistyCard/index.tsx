import './index.css'

export const TwistyCard = () => {
    return (
        <div className="card-container">
            <div className="card">
                <div className="box">
                    <div className="imgBx">
                        <video src="/vid.mp4" autoPlay loop muted/>
                    </div>
                </div>
                <div className="box">
                    <div className="card-content">
                        <h2>Lisa Simmons <br/> <span>Professional Artist</span></h2>
                        <ul>
                            <li>Posts <span>62</span></li>
                            <li>Followers <span>120</span></li>
                            <li>Following <span>47</span></li>
                        </ul>
                        <button>Follow</button>
                    </div>
                </div>
                <div className="circle">
                    <div className="imgBx">
                        <img src="/tauri.svg" alt="imgBx"/>
                    </div>
                </div>
            </div>
        </div>
    );
};
