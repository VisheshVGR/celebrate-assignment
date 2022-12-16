import React, { useState, useRef } from 'react'

import ReactCrop, {
    centerCrop,
    makeAspectCrop,
} from 'react-image-crop'
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect'

import 'react-image-crop/dist/ReactCrop.css'

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
    mediaWidth,
    mediaHeight,
    aspect,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

export default function App() {
    const [imgSrc, setImgSrc] = useState('')
    const previewCanvasRef = useRef(null)
    const imgRef = useRef(null)
    const [crop, setCrop] = useState()
    const [completedCrop, setCompletedCrop] = useState()
    const [scale, setScale] = useState(1)
    const [rotate, setRotate] = useState(0)
    const [aspect, setAspect] = useState(16 / 9)

    const [filterToUse, SetFilterToUse] = useState("Original");
    const [imageEditOption, setImageEditOption] = useState("crop");
    const [probStat, showProbStat] = useState(false)

    function onSelectFile(e) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined) // Makes crop preview update between images.
            const reader = new FileReader()
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || ''),
            )
            reader.readAsDataURL(e.target.files[0])
        }
    }

    function onImageLoad(e) {
        if (aspect) {
            const { width, height } = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
    }

    useDebounceEffect(
        async () => {
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current &&
                previewCanvasRef.current
            ) {
                // We use canvasPreview as it's much faster than imgPreview.
                canvasPreview(
                    imgRef.current,
                    previewCanvasRef.current,
                    completedCrop,
                    scale,
                    rotate,
                )
            }
        },
        100,
        [completedCrop, scale, rotate],
    )

    function handleToggleAspectClick() {
        if (aspect) {
            setAspect(undefined)
        } else if (imgRef.current) {
            const { width, height } = imgRef.current
            setAspect(16 / 9)
            setCrop(centerAspectCrop(width, height, 16 / 9))
        }
    }

    return (
        <div className="App">
            {!!completedCrop && (
                <>
                    <div className='preview'>
                        <canvas
                            ref={previewCanvasRef}
                            className={filterToUse}
                            style={{
                                border: '1px solid black',
                                objectFit: 'contain',
                                width: completedCrop.width,
                                height: completedCrop.height,
                            }}
                        />
                    </div>
                </>
            )}

            {
                imgSrc ?
                    <>
                        <div className='file-upload-btn' onClick={() => window.location.reload()}>Restart</div>
                    </> :
                    <>
                        <label for="file-upload" className="file-upload-btn">
                            <input id="file-upload" type="file" accept="image/*" onChange={onSelectFile} />
                            Upload Image
                        </label>

                    </>
            }
            {/* <div className='upload-image'> */}
            {/* <input  /> */}
            {/* </div> */}

            {
                imgSrc &&
                <div className='options'>
                    <div onClick={() => setImageEditOption("crop")}>Crop</div>
                    <div onClick={() => setImageEditOption("filter")}>Filter</div>
                </div>
            }
            {
                imgSrc && imageEditOption === "crop" &&
                <div className='options-crop'>
                    <div>
                        <label htmlFor="scale-input">Scale: </label>
                        <input
                            id="scale-input"
                            type="number"
                            step="0.1"
                            value={scale}
                            disabled={!imgSrc}
                            onChange={(e) => setScale(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label htmlFor="rotate-input">Rotate: </label>
                        <input
                            id="rotate-input"
                            type="number"
                            value={rotate}
                            disabled={!imgSrc}
                            onChange={(e) =>
                                setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))
                            }
                        />
                    </div>
                    <div>
                        <button onClick={handleToggleAspectClick}>
                            Toggle aspect {aspect ? 'off' : 'on'}
                        </button>
                    </div>
                    {imgSrc && (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                        >
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={imgSrc}
                                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                onLoad={onImageLoad}
                            />
                        </ReactCrop>
                    )}

                </div>
            }
            {
                imgSrc && imageEditOption === "filter" &&
                <div className='options-filter'>
                    <p>Select type of mask:</p>
                    <div onChange={(e) => SetFilterToUse(e.target.value)}>
                        <input type="radio" name="filter" value="Original" defaultChecked />
                        <label htmlFor="Original">Original</label><br />
                        <input type="radio" name="filter" value="mask1" />
                        <label htmlFor="mask1">Heart</label><br />
                        <input type="radio" name="filter" value="mask2" />
                        <label htmlFor="mask2">Square</label><br />
                        <input type="radio" name="filter" value="mask3" />
                        <label htmlFor="mask3">Circle</label>
                        <input type="radio" name="filter" value="mask4" />
                        <label htmlFor="mask4">Rectangle</label>
                    </div>
                </div>
            }

            <div className='prob-stat'>
                <div className='btn' onClick={() => showProbStat(!probStat)}>Problem Statement</div>
                {
                    probStat &&
                    <p>
                        Hii<br />
                        We are glad that you are interested in this internship. Please complete the assignment given below and  After successful submission of it we will individually contact you.<br /><br />

                        Assignment:-You have to make a responsive Web Page using HTML, CSS, and JavaScript that can perform the same function shown in the app.<br />
                        Instructions:- the video(explanation) and all the assets are in the drive link given below<br /><br />

                        Drive link:- https://drive.google.com/drive/folders/19KPJMdEZDQ4A0msAEeOcvQ5CCI7G3I52?usp=sharing<br /><br />


                        Instructions:-<br />
                        1-Write the complete code on your own, Don't copy code from internet and edit it. write from scratch.<br />
                        2-We also provided you the app also so you can easily get an idea of what you have to make. Give your best and submit the file.<br />
                        3-Deadline for submission:- 17 Dec 2022, 3pm<br />
                        4-Please submit here:-  https://forms.gle/v5YY7DiXYfDKrE6Q8<br /><br />

                        Important points for submission:-<br />
                        You need to submit a .zip file.<br />
                        The zip file should contain:-<br />
                        1-all vectors/images you used.<br />
                        2-index file.<br />
                        3-Any supporting Libraries, CSS files, etc.<br /><br />

                        All the Best.<br /><br />

                        Regards,<br /><br />
                        Team Celebrare<br />


                        <a href="https://docs.google.com/document/d/1f85XA6ORKtr7Ead14H65V5ynrry-i-tiNXT4NrD0Ug0/edit" target="_blank" without rel="noreferrer">See more...</a>
                    </p>
                }

            </div>
        </div>
    )
}
