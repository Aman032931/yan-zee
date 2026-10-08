import { useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  MapPin,
  Image,
  FileText,
  RotateCcw,
  Loader2,
  Upload,
  X,
} from "lucide-react"

import { useAuth } from "../../context/useAuth"

import {
  uploadShopImage,
  createShop,
} from "../../services/shopService"

export default function AddShop() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    contactEmail: currentUser?.email || "",
    image: "",
    description: "",
    returnPolicy: "",
    contactPhone: "",
    address: "",
  })

  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  const [uploadingImage, setUploadingImage] = useState(false)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // --------------------------------
  // Handle text input changes
  // --------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setError("")
  }

  // --------------------------------
  // Handle image selection
  // --------------------------------

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.")
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      setError("Image size must be less than 5 MB.")
      return
    }

    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))

    // Clear previously uploaded image URL
    setFormData((previous) => ({
      ...previous,
      image: "",
    }))

    setError("")
    setSuccess("")
  }

  // --------------------------------
  // Remove selected image
  // --------------------------------

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview("")

    setFormData((previous) => ({
      ...previous,
      image: "",
    }))

    setError("")
  }

  // --------------------------------
  // Go back
  // --------------------------------

  const handleBack = () => {
    navigate(-1)
  }

  // --------------------------------
  // Submit shop
  // --------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")
    setSuccess("")

    // -------------------------------
    // Validation
    // -------------------------------

    if (!formData.name.trim()) {
      setError("Please enter your shop name.")
      return
    }

    if (!formData.contactEmail.trim()) {
      setError("Please enter your shop email.")
      return
    }

    if (!formData.contactPhone.trim()) {
      setError("Please enter your shop phone number.")
      return
    }

    if (!formData.address.trim()) {
      setError("Please enter your shop address.")
      return
    }

    if (!formData.description.trim()) {
      setError("Please enter a shop description.")
      return
    }

    if (!selectedImage) {
      setError("Please select a shop image.")
      return
    }

    try {
      setLoading(true)

      // --------------------------------
      // 1. Upload image
      // --------------------------------

      setUploadingImage(true)

      const imageResponse = await uploadShopImage(
        selectedImage
      )

      setUploadingImage(false)

      /*
        Supported backend response formats:

        {
          data: {
            url: "https://..."
          }
        }

        OR

        {
          data: {
            image: "https://..."
          }
        }

        OR

        {
          url: "https://..."
        }

        OR

        {
          image: "https://..."
        }
      */

      const imageUrl =
        imageResponse?.data?.url ||
        imageResponse?.data?.image ||
        imageResponse?.url ||
        imageResponse?.image

      if (!imageUrl) {
        throw new Error(
          "Image was uploaded, but the server did not return an image URL."
        )
      }

      // --------------------------------
      // 2. Create shop
      // --------------------------------

      await createShop({
        name: formData.name.trim(),
        contactEmail: formData.contactEmail.trim(),
        image: imageUrl,
        description: formData.description.trim(),
        returnPolicy: formData.returnPolicy.trim(),
        contactPhone: formData.contactPhone.trim(),
        address: formData.address.trim(),
      })

      setFormData((previous) => ({
        ...previous,
        image: imageUrl,
      }))

      setSuccess(
        "Your shop has been created successfully!"
      )

      // --------------------------------
      // 3. Go to Seller Panel
      // --------------------------------

      setTimeout(() => {
        navigate("/seller", {
          replace: true,
        })
      }, 1000)
    } catch (err) {
      setUploadingImage(false)

      setError(
        err.message ||
          "Something went wrong while creating your shop."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* ======================================
            Back Button
        ====================================== */}

        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />

          Back
        </button>

        {/* ======================================
            Header
        ====================================== */}

        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
            <Store className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Set Up Your Shop
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Create your shop before entering the Seller
            Panel. Add your shop information so customers
            can learn more about your business.
          </p>
        </div>

        {/* ======================================
            Form
        ====================================== */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <div className="grid grid-cols-1 gap-6">

            {/* ==================================
                Shop Name
            ================================== */}

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Shop Name
              </label>

              <div className="relative">
                <Store className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="My Awesome Shop"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* ==================================
                Email + Phone
            ================================== */}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Email */}
              <div>
                <label
                  htmlFor="contactEmail"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Contact Email
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="shop@example.com"
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="contactPhone"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Contact Phone
                </label>

                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="9812121212"
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* ==================================
                Address
            ================================== */}

            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Shop Address
              </label>

              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Pokhara"
                  rows={3}
                  disabled={loading}
                  className="w-full resize-none rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* ==================================
                Shop Image
            ================================== */}

            <div>
              <label
                htmlFor="image"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Shop Image
              </label>

              {!imagePreview ? (
                <label
                  htmlFor="image"
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition ${
                    loading
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:border-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Upload className="mb-3 h-8 w-8 text-gray-400" />

                  <span className="text-sm font-medium text-gray-700">
                    Choose a shop image
                  </span>

                  <span className="mt-1 text-xs text-gray-500">
                    PNG, JPG, JPEG or WEBP · Max 5 MB
                  </span>

                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <img
                    src={imagePreview}
                    alt="Shop preview"
                    className="h-64 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={loading}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {selectedImage && (
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Image className="h-4 w-4" />

                  {selectedImage.name}
                </p>
              )}
            </div>

            {/* ==================================
                Description
            ================================== */}

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Shop Description
              </label>

              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell customers about your shop..."
                  rows={5}
                  disabled={loading}
                  className="w-full resize-none rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* ==================================
                Return Policy
            ================================== */}

            <div>
              <label
                htmlFor="returnPolicy"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Return Policy
              </label>

              <div className="relative">
                <RotateCcw className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />

                <textarea
                  id="returnPolicy"
                  name="returnPolicy"
                  value={formData.returnPolicy}
                  onChange={handleChange}
                  placeholder="Describe your return policy..."
                  rows={4}
                  disabled={loading}
                  className="w-full resize-none rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* ==================================
                Error
            ================================== */}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* ==================================
                Success
            ================================== */}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* ==================================
                Submit
            ================================== */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />

                  {uploadingImage
                    ? "Uploading Image..."
                    : "Creating Shop..."}
                </>
              ) : (
                <>
                  <Store className="h-5 w-5" />

                  Create Shop
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}