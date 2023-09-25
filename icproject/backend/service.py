import torch
import datetime
from diffusers import StableDiffusionPipeline

# https://huggingface.co/andite/anything-v4.0
# https://huggingface.co/stablediffusionapi/anything-v5
model_id = "stablediffusionapi/anything-v5"

if torch.cuda.is_available():
    device = "cuda"
else:
    device = "cpu"

pipe = StableDiffusionPipeline.from_pretrained(model_id)

pipe = pipe.to(device)

async def generate_image(payload):
    generate_list = []

    for i in range(payload.count):
        generate_list.append(torch.Generator(device).manual_seed(payload.seedList[i]))
    
    images_list = pipe(
        [payload.prompt] * payload.count,
        width=payload.width,
        height=payload.height,
        negative_prompt=[payload.negative] * payload.count,
        guidance_scale=payload.scale,
        num_inference_steps=payload.steps,
        generator=generate_list
    )

    images = []
    for i, image in enumerate(images_list["images"]):
        file_name = (
            "./outputs/image_"
            + datetime.datetime.now().strftime("%Y%m%d_%H%M%S%f")[:-3]
            + ".png"
        )
        image.save(file_name)
        images.append(image)

    return images