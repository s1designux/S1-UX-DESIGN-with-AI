// swift-render/main.swift — SwiftUI 갤러리를 PNG 로 떠 내는 작은 실행 파일.
// ─────────────────────────────────────────────────────────────────────────
// dist/platform/swift 의 소스를 한 글자도 고치지 않고 그대로 같이 컴파일한다(scripts/swift-gallery-render.js 가 한다).
// macOS 의 ImageRenderer 로 구역(S1GallerySection)마다 라이트·다크 PNG 한 장씩 저장한다.
//
// 사용: swift-render <출력 폴더> [서체 이름(기본 Pretendard)] [가로 pt(기본 390)]
// 서체 이름에 "-" 를 주면 기기 기본 서체로 그린다.

import SwiftUI
import AppKit

let arguments = CommandLine.arguments
let outputDirectory = arguments.count > 1 ? arguments[1] : "."
let familyArgument = arguments.count > 2 ? arguments[2] : "Pretendard"
let family: String? = familyArgument == "-" ? nil : familyArgument
let width: CGFloat = arguments.count > 3 ? CGFloat(Double(arguments[3]) ?? 390) : 390

@MainActor
func save<V: View>(_ view: V, name: String) -> Bool {
    let renderer = ImageRenderer(content: view.environment(\.s1StaticFields, true).frame(width: width).fixedSize(horizontal: false, vertical: true))
    renderer.scale = 2
    guard let image = renderer.nsImage,
          let tiff = image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: tiff),
          let png = bitmap.representation(using: .png, properties: [:]) else {
        FileHandle.standardError.write(Data("렌더 실패: \(name)\n".utf8))
        return false
    }
    do {
        try png.write(to: URL(fileURLWithPath: "\(outputDirectory)/\(name).png"))
        return true
    } catch {
        FileHandle.standardError.write(Data("저장 실패: \(name) — \(error)\n".utf8))
        return false
    }
}

MainActor.assumeIsolated {
    var saved = 0
    var failed = 0
    for section in S1GallerySection.allCases {
        for (scheme, label) in [(S1ColorScheme.light, "light"), (S1ColorScheme.dark, "dark")] {
            let ok = save(S1GallerySectionView(section, scheme: scheme, fontFamily: family), name: "\(section.rawValue)-\(label)")
            if ok { saved += 1 } else { failed += 1 }
        }
    }
    print("saved=\(saved) failed=\(failed)")
    exit(failed == 0 ? 0 : 1)
}
