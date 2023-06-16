import { useEffect, useLayoutEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { Button, ConfigProvider, DatePicker, Form, Input, InputNumber, Radio, Slider, Space } from "antd"
import moment from 'moment/moment'
import axios from 'axios'
import { createClient, get } from '@vercel/edge-config';
import Progressbar from './Progressbar'

const musicList = [
    'https://www.youtube.com/watch?v=MWvRNqJ16Gs',
    'https://www.youtube.com/watch?v=-g639NhOACk',
    'https://www.youtube.com/watch?v=D1JCO_syWWc',
    'https://www.youtube.com/watch?v=gm8uqPseA9E',
    'https://www.youtube.com/watch?v=q5nNqnd0uBo'
]

const App = () => {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    const [ref, setRef] = useState()
    const [form] = Form.useForm();

    const [volume, setvolume] = useState(0);
    const [musicPlaying, setMusicPlaying] = useState(true);
    const rand = (min, max) => {
        return min + Math.floor(Math.random() * max);
    }

    const [oldMusic, setOldMusic] = useState("");
    const [musicUrl, setMusicUrl] = useState(musicList[rand(0, musicList.length)])
    const [formData, setFormData] = useState({});

    const [opacityRegister, setOpacityRegister] = useState(0);
    const [registerShow, setRegisterShow] = useState(false);
    const [menuShow, setMenuShow] = useState(false);

    const [playShow, setPlayShow] = useState(false);
    const [hasIdentity, SethasIdentity] = useState(false);


    const [modalData, SetModalData] = useState({});
    const [modalShow, setModalShow] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [busyTimeout, setBusyTimeout] = useState();
    const [currentTime, setcurrentTime] = useState(0);
    const [currentDuration, setcurrentDuration] = useState(0);

    const disableFor = ms => {
        if (busyTimeout) {
            clearTimeout(busyTimeout);
        }
        setIsBusy(true);
        setBusyTimeout(setTimeout(() => {
            setIsBusy(false);
        }, ms))
    }

    const showModal = (title = "System", message = "") => {
        if (busyTimeout) {
            clearTimeout(busyTimeout);
        }
        SetModalData({
            title,
            message
        })
        setBusyTimeout(setTimeout(() => {
            setModalShow(true);
        }, 10));
    }

    // Register form
    const onSubmit = async (values) => {
        if (values.firstname === undefined || values.firstname === "") {
            return showModal("Firstname Missing", "กรุณากรอกชื่อจริงของคุณ");
        }

        if (values.firstname.charAt(0) !== values.firstname.charAt(0).toUpperCase()) {
            return showModal("Firstname Error", "ชื่อจริงจำเป็นต้องขึ้นต้นด้วยตัวพิมพ์ใหญ่");
        }

        if (values.lastname === undefined || values.lastname === "") {
            return showModal("Lastname Missing", "กรุณากรอกนาสกุลของคุณ");
        }

        if (values.lastname.charAt(0) !== values.lastname.charAt(0).toUpperCase()) {
            return showModal("Lastname Error", "นามสกุลจำเป็นต้องขึ้นต้นด้วยตัวพิมพ์ใหญ่");
        }

        if (values.height === undefined || values.height === "") {
            return showModal("Height Missing", "กรุณากรอกส่วนสูงของคุณ");
        }

        if (values.height < 110) {
            return showModal("Height Error", "ส่วนสูงควรไม่ต่ำกว่า 110 เซนติเมตร");
        }

        if (values.dob === undefined || values.dob === "") {
            return showModal("Date of Birth Missing", "กรุณาเลือกวันเกิดของคุณ");
        }

        if (values.gender === undefined || values.gender === "") {
            return showModal("Gender Missing", "กรุณาเลือกเพศของคุณ");
        }

        if (values.gender === "more" && values['more-gender'] === undefined || values['more-gender'] === "") {
            return showModal("Gender Missing", "กรุณาระบุเพศของคุณ");
        }

        setRegisterShow(false);
        await wait(800);
        setOpacityRegister(1);
        await wait(3000);

        axios.post("https://athens-loadscreen/register", JSON.stringify({
            ...values,
            dob: moment(values.dob.$d).format("D/MM/YYYY")
        }))
    }

    useEffect(() => {
        const onMessage = e => {
            const data = e.data;

            if (data.eventName === "playerLoaded") {
                setPlayShow(true);
                SethasIdentity(data.hasIdentity)
            }
        }

        window.addEventListener("message", onMessage)
        const updateInfo = setInterval(() => {
            const player = ref;
            setcurrentTime(player.getCurrentTime())
            setcurrentDuration(player.getDuration())
        }, 1000);

        return () => {
            window.removeEventListener("message", onMessage)
            clearInterval(updateInfo)
        }
    })

    const fancyTimeFormat = (duration) => {
        // Hours, minutes and seconds
        const hrs = ~~(duration / 3600);
        const mins = ~~((duration % 3600) / 60);
        const secs = ~~duration % 60;

        // Output like "1:01" or "4:03:59" or "123:03:59"
        let ret = "";

        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }

        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;

        return ret;
    }

    return <>
        <div className="main-screen">
            <ReactPlayer
                ref={refs => setRef(refs)}
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
                onEnded={() => {
                    setMusicUrl(musicList[rand(0, musicList.length)])
                    ref.seekTo(0, "seconds")
                }}
            />
            <div className="music-info-controller">
                <div className="timestamp-bar">
                    <div className="box">
                        <div className="bar" style={{
                            width: `${(currentTime / currentDuration) * 100}%`
                        }}></div>
                    </div>
                    <div className="time">
                        {fancyTimeFormat(currentTime)}
                    </div>
                    <div className="max-time">
                        {fancyTimeFormat(currentDuration)}
                    </div>
                </div>
                <div className="action-bar">
                    <div className="previous-btn" onClick={() => {
                        setMusicUrl(musicList[rand(0, musicList.length)])
                        ref.seekTo(0, "seconds")
                    }}>
                        <i class="fa-regular fa-angles-left"></i>
                    </div>
                    <div className={"play-pause" + (musicPlaying ? " isPlay" : "")} onClick={() => setMusicPlaying(prev => !prev)}>
                        <i class="fa-duotone fa-play"></i>
                        <i class="fa-solid fa-pause"></i>
                    </div>
                    <div className="next-btn" onClick={() => {
                        setMusicUrl(musicList[rand(0, musicList.length)])
                        ref.seekTo(0, "seconds")
                    }}>
                        <i class="fa-regular fa-angles-right"></i>
                    </div>
                </div>
                <div className="volume-control">
                    <div className="title">
                        VOLUME
                    </div>
                    <Slider value={volume * 100} max={100} min={0} onChange={value => setvolume(value / 100)} />
                </div>
            </div>
            <div className="menu-container show">
                <div className="content">
                    <div className="menu">
                        HOME
                    </div>
                    <a className="menu" href="https://bit.ly/3oRA27u" target='_blank' onClick={() => window.invokeNative('openUrl', "https://bit.ly/3oRA27u")}>
                        RULES
                    </a>
                    <div className="header">
                        <img src="img/logo.png" alt="" />
                    </div>
                    <div className="menu">
                        NEW PLAYER
                    </div>
                    <a className="menu" href="https://bit.ly/3oRA27u" target='_blank' onClick={() => window.invokeNative('openUrl', "https://bit.ly/3oRA27u")}>
                        DISCORD
                    </a>
                </div>
            </div>
            <ReactPlayer
                volume={0}
                url='https://www.youtube.com/watch?v=IaGe-Wc7ahQ'
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
            <Progressbar />
            <div className={"play-button" + (playShow ? " ready" : "")} onClick={async () => {
                if (!hasIdentity) {
                    setOpacityRegister(0);
                    setMenuShow(true);
                    await wait(2000);
                    setRegisterShow(true);
                } else {
                    setOpacityRegister(0);
                    setMenuShow(true);
                    await wait(2000);
                    setOpacityRegister(1);
                    await wait(3000);
                    axios.post("https://athens-loadscreen/pressPlay")
                }
            }}>
                PLAY
            </div>
        </div>

        <div className={"menu-ontop" + (menuShow ? " show" : "")}>
            <div className="logo-server" style={{
                opacity: opacityRegister
            }}></div>
            <div className={"register-menu" + (registerShow ? " show" : "")}>
                <div className="left-side">
                    <div className="title">
                        แบบฟอร์ม ข้อมูลบัตรประชาชน
                    </div>
                    <Form
                        form={form}
                        layout='vertical'
                        onValuesChange={value => setFormData(prev => {
                            return {
                                ...prev,
                                ...value,
                            }
                        })}
                        onFinish={onSubmit}
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
                            {formData.firstname !== "" && formData.firstname || "Unknow"}&nbsp;{formData.lastname !== "" && formData.lastname || "Unknow"}
                        </div>
                    </div>
                    <div className="card-image">
                        <i class="fa-solid fa-user"></i>
                    </div>
                </div>
            </div>
        </div>

        <div className={"modal" + (modalShow ? " show" : "")}>
            <div className="modal-background" onClick={() => {
                if (busyTimeout) {
                    clearTimeout(busyTimeout)
                }
                setModalShow(false)
                setBusyTimeout(setTimeout(() => {
                    SetModalData({})
                }, 400))
            }} />
            <div className="modal-container">
                <div className="modal-title">
                    {modalData.title || ""}
                </div>
                <div className="modal-subtitle">
                    {modalData.message || ""}
                </div>
                <div className="modal-action">
                    <div className="modal-btn" onClick={() => {
                        if (busyTimeout) {
                            clearTimeout(busyTimeout)
                        }
                        setModalShow(false)
                        setBusyTimeout(setTimeout(() => {
                            SetModalData({})
                        }, 400))
                    }}>
                        ตกลง
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default App