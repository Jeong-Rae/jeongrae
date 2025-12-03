export function slugify(title: string): string {
	return title
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9\-가-힣]/g, "")
		.replace(/\-+/g, "-")
		.replace(/^\-+|\-+$/g, "");
}
