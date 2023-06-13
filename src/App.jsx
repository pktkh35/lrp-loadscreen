import { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'

import { Button, ConfigProvider, DatePicker, Form, Input, InputNumber, Radio, Space } from "antd"
import moment from 'moment/moment'

const musicList = [
    'https://www.youtube.com/watch?v=MWvRNqJ16Gs',
    'https://www.youtube.com/watch?v=-g639NhOACk',
    'https://www.youtube.com/watch?v=D1JCO_syWWc',
    'https://www.youtube.com/watch?v=gm8uqPseA9E'
]

const App = () => {
    const [volume, setvolume] = useState(0);
    const [musicPlaying, setMusicPlaying] = useState(true);
    const rand = (min, max) => {
        return min + Math.floor(Math.random() * max);
    }

    const [musicUrl, setMusicUrl] = useState(musicList[rand(0, musicList.length)])

    const [formData, setFormData] = useState({});

    useEffect(() => {
        var types = [
            "INIT_CORE",
            "INIT_BEFORE_MAP_LOADED",
            "MAP",
            "INIT_AFTER_MAP_LOADED",
            "INIT_SESSION"
        ];
        var stateCount = 4;
        var states = {};
        var progressCache = [];

        const handlers = {
            startInitFunction(data) {
                //Create a entry for every type.
                if (states[data.type] == null) {
                    states[data.type] = {};
                    states[data.type].count = 0;
                    states[data.type].done = 0;


                    //NOTE: We increment the stateCount if we do receive the INIT_CORE.
                    //      Because INIT_CORE is the first type, it will not always be invoked due to a race condidition.
                    //      See Issue #1 on github.
                    if (data.type == types[0]) {
                        stateCount++;
                    }
                }
            },

            startInitFunctionOrder(data) {
                //Collect the total count for each type.
                if (states[data.type] != null) {
                    states[data.type].count += data.count;
                }
            },

            initFunctionInvoked(data) {
                //Increment the done accumulator based on type.
                if (states[data.type] != null) {
                    states[data.type].done++;
                }
            },

            startDataFileEntries(data) {
                //Manually add the MAP type.
                states["MAP"] = {};
                states["MAP"].count = data.count;
                states["MAP"].done = 0;
            },

            performMapLoadFunction(data) {
                //Increment the map done accumulator.
                states["MAP"].done++;
            }

        };

        window.addEventListener('message', function (e) {
            (handlers[e.data.eventName] || function () { })(e.data);
        });

        //Get the progress of a specific type. (See types array).
        function GetTypeProgress(type) {
            if (states[type] != null) {
                var progress = states[type].done / states[type].count;
                return Math.round(progress * 100);
            }

            return 0;
        }

        //Get the total progress for all the types.
        function GetTotalProgress() {
            var totalProgress = 0;
            var totalStates = 0;

            for (var i = 0; i < types.length; i++) {
                var key = types[i];
                if (config.progressBars[key].enabled) {
                    totalProgress += GetTypeProgress(key);
                    totalStates++;
                }
            }

            //Dont want to divide by zero because it will return NaN.
            //Be nice and return a zero for us.
            if (totalProgress == 0) return 0;

            return totalProgress / totalStates;
        }

        //Cache to keep track of all progress values.
        //This is need for the Math.max functions (so no backwards progressbars).
        function Init() {
            var progressBar = document.getElementById("progressbar");
            progressBar.classList.remove("hide");

            setInterval(UpdateSingle, 250);
        }

        //Update the single progressbar.
        function UpdateSingle() {
            var progressBar = document.getElementById("progressbar");
            progressBar.value = progressCache[10];

        }

        document.onkeydown = key => {
            if ([32].includes(key.which)) {
                setMusicPlaying(prev => !prev);
            }
        }

        Init()
    }, [])

    return <>

        <div className="main-screen">
            <ReactPlayer
                volume={volume}
                url={musicUrl}
                width={0}
                height={0}
                className="music"
                playing={musicPlaying}
                controls={false}
                config={{
                    youtube: {
                        playerVars: { showinfo: 0 }
                    },
                }}
                onPlay={() => setvolume(0.09)}
                style={{
                    zIndex: 999999
                }}
                onEnded={() => setMusicUrl(musicList[rand(0, musicList.length)])}
            />
            <div className="menu-container show">
                <div className="content">
                    <div className="menu">
                        HOME
                    </div>
                    <a className="menu" href="https://bit.ly/3oRA27u" target='_blank' onClick={() => window.invokeNative("https://bit.ly/3oRA27u")}>
                        RULES
                    </a>
                    <div className="header">
                        <img src="img/logo.png" alt="" />
                    </div>
                    <div className="menu">
                        NEW PLAYER
                    </div>
                    <a className="menu" href="https://bit.ly/3oRA27u" target='_blank' onClick={() => window.invokeNative("https://bit.ly/3oRA27u")}>
                        DISCORD
                    </a>
                </div>
            </div>
            <ReactPlayer
                volume={0}
                url='https://www.youtube.com/watch?v=sauDhxaQuJ8'
                className="sc-background"
                width="100%"
                height="100%"
                playing={true}
                controls={false}
                loop
                config={{
                    youtube: {
                        playerVars: { showinfo: 0 }
                    },
                }}
            />
            <div className="logo-server" />
            <div className="logo-developer" />
            <div className="progressbar">
                <div className="bar" id="progressbar"></div>
            </div>

            <div className="play-button">
                PLAY
            </div>
        </div>

        <div className="menu-ontop">
            <div className="logo-server" style={{
                opacity: "0"
            }}></div>
            <div className="register-menu show">
                <div className="left-side">
                    <div className="title">
                        แบบฟอร์ม ข้อมูลบัตรประชาชน
                    </div>
                    <Form
                        layout='vertical'
                        onValuesChange={value => setFormData(prev => {
                            return {
                                ...prev,
                                ...value,
                            }
                        })}
                    >
                        <div className='form-group'>
                            <Form.Item label="ชื่อจริง" name="firstname">
                                <Input placeholder="กรุณากรอกชื่อจริง" />
                            </Form.Item>
                            <Form.Item label="นามสกุล" name="lastname">
                                <Input placeholder="กรุณากรอกนามสกุล" />
                            </Form.Item>
                        </div>
                        <div className='form-group'>
                            <Form.Item label="ส่วนสูง" name="height">
                                <InputNumber placeholder='กรุณากรอกส่วนสูง' min={110} max={300} style={{
                                    width: "100%"
                                }} />
                            </Form.Item>
                            <Form.Item label="วันเดือนปีเกิด" name="dob">
                                <DatePicker placeholder="กรุณาเลือกวัน/เดือน/ปี เกิด" style={{
                                    width: "100%"
                                }} />
                            </Form.Item>
                        </div>
                        <div className='form-group'>
                            <Form.Item label="เพศ" name="gender">
                                <Radio.Group>
                                    <Radio value="male">ชาย</Radio>
                                    <Radio value="female">หญิง</Radio>
                                    <Radio value="more">อื่นๆ</Radio>
                                </Radio.Group>
                            </Form.Item>
                            {
                                formData.gender === "more" ? <Form.Item label="กรุณาระบุเพศเพิ่มเติม" name="more-gender">
                                    <Input placeholder="กรุณาระบุเพศ" />
                                </Form.Item> : null
                            }
                        </div>

                        <div className="bottom">
                            <ConfigProvider theme={{
                                token: {
                                    borderRadius: "2.2vmin"
                                }
                            }}>
                                <Button type='primary' htmlType='submit'>
                                    ยืนยัน
                                </Button>
                            </ConfigProvider>
                        </div>
                    </Form>
                </div>
                <div className="id-card">
                    <div className="logo-background"></div>
                    <div className="card-title">
                        บัตรประจำตัวประชาชน ( Identifier Card )
                    </div>
                    <div className="card-name">
                        <div className="header">
                            ชื่อและสกุล
                        </div>
                        <div className="value">
                            {formData.firstname !== "" && formData.firstname || "Unknow"}&nbsp;{formData.lastname !== "" && formData.lastname || "Unknow"}
                        </div>
                    </div>
                    <div className="card-dob">
                        <div className="header">
                            วันเดือนปีเกิด
                        </div>
                        <div className="value">
                            {formData.dob ? moment(formData.dob.$d).format("D/MM/YYYY") : "UNKNOW"}
                        </div>
                    </div>
                    <div className="card-height">
                        <div className="header">
                            ส่วนสูง
                        </div>
                        <div className="value">
                            {formData.height ? formData.height : "UNKNOW"} cm
                        </div>
                    </div>
                    <div className="card-gender">
                        <div className="header">
                            เพศ
                        </div>
                        <div className="value">
                            {(formData.gender === "more" ? formData['more-gender'] : formData.gender) || "UNKNOW"}
                        </div>
                    </div>
                    <div className="card-signature">
                        <div className="value">
                            {formData.firstname !== "" && formData.firstname || "Unknow"}
                        </div>
                    </div>
                    <div className="card-image">
                        <i class="fa-solid fa-user"></i>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default App