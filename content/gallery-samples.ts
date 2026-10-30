// Stand-in photos for the Gallery until the studio uploads its own (credits: public/samples/CREDITS.md and
// the credits-batch-*.md files next to it). Titles describe what a picture shows. They never claim a
// picture is an Alvi Studio project.
import { photo, type SamplePhoto } from "./gallery-types";
import { batchA } from "./gallery-batches/batch-a";
import { batchB } from "./gallery-batches/batch-b";
import { batchC } from "./gallery-batches/batch-c";

export type { SamplePhoto };

const first: SamplePhoto[] = [
  photo("full-house-3", "elevation", "Two-storey house with timber and stone panels", "Modern two-storey house with a flat roof, timber slat panels, a stone feature wall and tall black-framed windows"),
  photo("full-house-2", "elevation", "Concrete house with lawn and sun loungers", "Modern concrete house with a tree, a lawn and two sun loungers under parasols"),
  photo("full-house-1", "elevation", "Plaster and timber facade with garden", "Tall facade finished in plaster and vertical timber with greenery around it"),
  photo("full-house-4", "hall", "Living room with a white brick wall and plants", "Bright living room with a grey sofa, a white brick wall, two empty frames and large indoor plants"),
  photo("renovation-2", "hall", "Bright living room with two armchairs", "Light living room with wooden armchairs, a round coffee table, a sofa and large windows"),
  photo("renovation-1", "hall", "Sofa corner beside a fireplace", "Soft grey sofa and a wooden side table in front of a dark fireplace with stacked logs"),
  photo("renovation-3", "hall", "Plain walls, white sofa and a plant", "Clean white room with a sofa, a woven basket plant pot and a timber-framed panel"),
  photo("tuition-classes-3", "tuition-class", "Classroom with long desks and tall windows", "Large classroom with rows of long desks, tall windows with curtains and a wall-mounted air conditioner"),
  photo("tuition-classes-1", "tuition-class", "Classroom with green chairs and writing desks", "Classroom filled with rows of green chairs with attached writing desks"),
  photo("tuition-classes-2", "tuition-class", "Classroom with desks and sunlit windows", "Classroom with dark wooden desks, chairs and tall sunlit windows along one wall"),
  photo("farm-1", "farmhouse", "Farmhouse among vegetable fields", "Small house with a tiled roof standing among rows of green crops under a blue sky"),
  photo("farm-2", "farmhouse", "Aerial view of farmhouses and fields", "Aerial view of modern white houses with a small pool, gardens and crop fields around them"),
  photo("farm-3", "farmhouse", "House on a green lawn with tall trees", "Country house beside a wide green lawn and tall trees under a bright sky"),
  photo("farm-4", "farmhouse", "White farm building on open grass", "White building with a red roof standing alone on open grassland"),
];

/** Every sample photo; the Gallery page groups them by category in the order of galleryCategories. */
export const gallerySamples: SamplePhoto[] = [...first, ...batchC, ...batchA, ...batchB];

export const sampleSrc = (p: SamplePhoto) => `/samples/gallery/${p.id}.jpg`;
