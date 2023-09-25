'use client'

import { useRef, useState } from "react"
import { CreateType } from "./types"
import JSZip from "jszip"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"

const SIZE_OPTIONS = [
    { ratio: '7:4', width: 896, height: 512 },
    { ratio: '3:2', width: 768, height: 512 },
    { ratio: '5:4', width: 640, height: 512 },
    { ratio: '1:1', width: 512, height: 512 },
    { ratio: '4:5', width: 512, height: 512 },
    { ratio: '2:3', width: 512, height: 512 },
    { ratio: '4:7', width: 512, height: 512 },
]

const MAX_IMAGE_COUNT = 4

const Create = ({ loading, setLoading, setImages }: CreateType) => {
    const promptRef = useRef<HTMLTextAreaElement>(null)
    const negativeRef = useRef<HTMLTextAreaElement>(null)
    const scaleRef = useRef<HTMLInputElement>(null)
    const stepsRef = useRef<HTMLInputElement>(null)
    const seedRef = useRef<HTMLInputElement>(null)
    const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[3])
    const [size, setSize] = useState(3)
    const [count, setCount] = useState(1)
    const [error, setError] = useState<string | null>(null)

    const countHandleChange = (value: number | number[]) => {
        const numValue = value as number
        setCount(numValue)
    }

    const sizeHandleChange = (value: number | number[]) => {
        const numValue = value as number
        setSize(numValue)
        setSelectedSize(SIZE_OPTIONS[numValue])
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const prompt = promptRef.current!.value
        const negative = negativeRef.current!.value
        const width = selectedSize.width
        const height = selectedSize.height
        const ratio = selectedSize.ratio
        const scale = parseFloat(scaleRef.current!.value)
        const steps = parseInt(stepsRef.current!.value,10)
        const seed = parseInt(seedRef.current!.value,10)

        const seedList = []
        for(let i = 0; i < count; i ++){
            if(!seed){
                seedList.push(Math.floor(Math.random() * 1000000000))
            } else {
                seedList.push(seed)
            }
        }

        try {
            const body = {
                prompt,
                negative,
                count,
                width,
                height,
                scale,
                steps,
                seedList,
            }

            const response = await fetch('http://localhost:8000/api/generate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            if(!response.ok){
                const errorData = await response.json()
                setError(`Xảy ra lỗi:  ${errorData.detail}`)
                setLoading(false)
                return
            }

            const zipBlob = await response.blob()

            const zipArrayBuffer = await zipBlob.arrayBuffer()

            const zip = await JSZip.loadAsync(zipArrayBuffer)

            const imageDataList = []
            for(const [index, fileName] of Object.entries(Object.keys(zip.files))){
                const imageFile = zip.file(fileName)
                const imageData = await imageFile!.async('blob')
                const imageObjectURL = URL.createObjectURL(imageData)
                imageDataList.push({
                    imageSrc: imageObjectURL,
                    prompt,
                    negative,
                    ratio,
                    width,
                    height,
                    seed: seedList[parseInt(index, 10)],
                    steps,
                })
            }
            setImages(imageDataList)
        } catch (error) {
            alert(error)
        }

        setLoading(false)
    }

    return (
        <>
            <div className="border-b-2 border-blue-100 mb-4 font-bold text-lg">Create</div>
            <form onSubmit={onSubmit}>
                <div className="p-4 rounded-lg bg-[#E6F2FF] shadow">
                    <div className="mb-5">
                        <div className="font-bold mb-2 text-sm">Prompt</div>
                        <textarea
                            className="w-full border rounded-lg p-2 focus:outline-none bg-gray-50 focus:bg-white"
                            rows={3}
                            ref={promptRef}
                            id="prompt"
                            required
                        />
                    </div>
                    <div className="mb-5">
                        <div className="font-bold mb-2 text-sm">Negative Prompt</div>
                        <textarea
                            className="w-full border rounded-lg p-2 focus:outline-none bg-gray-50 focus:bg-white"
                            rows={3}
                            ref={negativeRef}
                            id="negative"
                        />
                    </div>
                    <div className="mb-5">
                        <div className="font-bold mb-2 text-sm">Image Count</div>
                        <div className="px-2">
                            <Slider
                                min={1}
                                max={MAX_IMAGE_COUNT}
                                value={count}
                                onChange={countHandleChange}
                                trackStyle={{ backgroundColor: 'rgba(29,78,216)', height: 4 }}
                                handleStyle={{
                                    borderColor: 'rgba(29,78,216)',
                                    borderWidth: 2,
                                    backgroundColor: 'rgba(29,78,216)',
                                    width: 16,
                                    height: 16,
                                }}
                                railStyle={{ backgroundColor: 'rgba(219,234,254)', height: 4 }}
                            />
                        </div>

                        <div className="flex justify-between mt-2 text-sm">
                            {Array.from({ length: MAX_IMAGE_COUNT }, (_, i) => i + 1).map((data, index) => (
                                <div key={index}>{data}</div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-5">
                        <div className="flex justify-between">
                            <div className="font-bold mb-2 text-sm">Size</div>
                            <div className="text-sm">
                                {selectedSize.width} x {selectedSize.height}
                            </div>
                        </div>
                        <div className="px-2">
                            <Slider
                                min={0}
                                max={SIZE_OPTIONS.length - 1}
                                value={size}
                                onChange={sizeHandleChange}
                                trackStyle={{ backgroundColor: 'rgba(29,78,216)', height: 4 }}
                                handleStyle={{
                                    borderColor: 'rgba(29,78,216)',
                                    borderWidth: 2,
                                    backgroundColor: 'rgba(29,78,216)',
                                    width: 16,
                                    height: 16,
                                }}
                                railStyle={{ backgroundColor: 'rgba(219,234,254)', height: 4 }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-sm">
                            {SIZE_OPTIONS.map((data, index) => (
                                <div key={index}>{data.ratio}</div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-5">
                        <div className="font-bold mb-2 text-sm">Guidance Scale</div>
                        <input
                            className="w-full border rounded-lg p-2 focus:outline-none bg-gray-50 focus:bg-white"
                            type="number"
                            step={0.5}
                            ref={scaleRef}
                            id="scale"
                            defaultValue={7.5}
                            required
                        />
                    </div>
                    <div className="mb-5">
                        <div className="font-bold mb-2 text-sm">Number of Interface Steps</div>
                        <input
                            className="w-full border rounded-lg p-2 focus:outline-none bg-gray-50 focus:bg-white"
                            type="number"
                            ref={stepsRef}
                            id="steps"
                            defaultValue={30}
                            required
                        />
                    </div>
                    <div className="mb-5">
                        <div className="font-bold mb-2 text-sm">Seed</div>
                        <input
                            className="w-full border rounded-lg p-2 focus:outline-none bg-gray-50 focus:bg-white"
                            type="number"
                            ref={seedRef}
                            id="seed"
                        />
                    </div>
                    {error && <div className="text-red-500 text-center mb-5">{error}</div>}
                    <div>
                        <button 
                            type="submit"
                            className="w-full text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
                            disabled={loading}
                        >
                            <div className="flex items-end justify-center space-x-3">
                                {loading && (
                                    <div className="h-4 w-4 animate-spin rounded-full border border-white border-t-transparent"/>
                                )}
                                <div>Generate</div>
                            </div>
                        </button>
                    </div>
                </div>
            </form>
        </>
    )
}

export default Create;