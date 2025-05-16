import { PageHeader } from "@/components/PageHeader"
import { db } from "@/drizzle/db"
import { CourseTable } from "@/drizzle/schema"
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses"
import { ProductForm } from "@/features/products/components/ProductForm"
import { asc } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

export default async function NewProductPage() {
  return (
    <div className="container my-6">
      <PageHeader title="New Product" />
      <ProductForm courses={await getCourses()} />
    </div>
  )
}

async function getCourses() {
  "use cache"
  cache(getCourseGlobalTag())

  return db.query.CourseTable.findMany({
    orderBy: asc(CourseTable.name),
    columns: { id: true, name: true },
  })
}
