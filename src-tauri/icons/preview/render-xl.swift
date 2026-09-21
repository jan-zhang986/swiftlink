import AppKit
import Foundation

let size = 1024
let pad: CGFloat = 80
let color = NSColor(srgbRed: 42.0 / 255.0, green: 171.0 / 255.0, blue: 238.0 / 255.0, alpha: 1)

guard let rep = NSBitmapImageRep(
  bitmapDataPlanes: nil,
  pixelsWide: size,
  pixelsHigh: size,
  bitsPerSample: 8,
  samplesPerPixel: 4,
  hasAlpha: true,
  isPlanar: false,
  colorSpaceName: .deviceRGB,
  bytesPerRow: 0,
  bitsPerPixel: 0
) else {
  fputs("bitmap failed\n", stderr)
  exit(1)
}
rep.size = NSSize(width: size, height: size)

guard let ctx = NSGraphicsContext(bitmapImageRep: rep) else {
  fputs("context failed\n", stderr)
  exit(1)
}
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = ctx
let cg = ctx.cgContext
cg.setFillColor(NSColor.clear.cgColor)
cg.fill(CGRect(x: 0, y: 0, width: size, height: size))

let inner = CGFloat(size) - pad * 2
let rect = CGRect(x: pad, y: pad, width: inner, height: inner)
let radius = inner * 0.227
let path = NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius)
color.setFill()
path.fill()

let font = NSFont.systemFont(ofSize: 348, weight: .heavy)
let style = NSMutableParagraphStyle()
style.alignment = .center
let attrs: [NSAttributedString.Key: Any] = [
  .font: font,
  .foregroundColor: NSColor.white,
  .paragraphStyle: style,
  .kern: -14,
]
let text = NSAttributedString(string: "XL", attributes: attrs)
let textSize = text.size()
let textRect = CGRect(
  x: (CGFloat(size) - textSize.width) / 2,
  y: (CGFloat(size) - textSize.height) / 2 - 18,
  width: textSize.width,
  height: textSize.height
)
text.draw(in: textRect)

NSGraphicsContext.restoreGraphicsState()

guard let png = rep.representation(using: .png, properties: [:]) else {
  fputs("png failed\n", stderr)
  exit(1)
}

let out = CommandLine.arguments.count > 1
  ? CommandLine.arguments[1]
  : "src-tauri/icons/swiftlink-source.png"
try png.write(to: URL(fileURLWithPath: out))
print("wrote \(out) \(png.count)")
