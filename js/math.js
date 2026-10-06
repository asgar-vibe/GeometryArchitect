/**
 * ============================================================================
 * GEOMETRY ARCHITECT - MATHEMATICAL GEOMETRY & VECTOR ENGINE
 * ============================================================================
 * Mathematical vector geometry library providing:
 * 1. Vector Operations (Dot, Cross, Magnitude, Normalize, Reflect)
 * 2. Mathematical Intersections:
 *    - Line-Line (Segment-Segment & Extended Infinite Line)
 *    - Line-Circle (Ray/Segment vs Circle via Quadratic Solution)
 *    - Circle-Circle (Radical axis & intersecting chord)
 * 3. Distance & Projection calculations for Snapping
 * 4. Reflection Physics (Incident Angle = Reflected Angle with Surface Normal)
 * ============================================================================
 */

class GeoMath {
  static EPSILON = 1e-7;

  // --------------------------------------------------------------------------
  // [1] Vector Operations
  // --------------------------------------------------------------------------

  /** Vector from A to B: B - A */
  static sub(b, a) {
    return { x: b.x - a.x, y: b.y - a.y };
  }

  /** Vector addition */
  static add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  /** Scalar multiplication */
  static scale(v, s) {
    return { x: v.x * s, y: v.y * s };
  }

  /** Dot Product: a · b = ax*bx + ay*by */
  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  /** 2D Cross Product / Determinant: ax*by - ay*bx */
  static cross(a, b) {
    return a.x * b.y - a.y * b.x;
  }

  /** Vector length / Euclidean norm */
  static length(v) {
    return Math.hypot(v.x, v.y);
  }

  /** Euclidean distance between two points */
  static distance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  /** Unit vector / Normalize */
  static normalize(v) {
    const len = Math.hypot(v.x, v.y);
    if (len < GeoMath.EPSILON) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
  }

  /** Perpendicular normal vector (90 deg clockwise) */
  static normal(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return GeoMath.normalize({ x: -dy, y: dx });
  }

  /**
   * Reflection vector:
   * Physics Law: r = d - 2 * (d · n) * n
   * @param {Object} dir - Incident direction vector (Normalized)
   * @param {Object} normal - Surface normal vector (Normalized)
   */
  static reflect(dir, normal) {
    const dDotN = GeoMath.dot(dir, normal);
    return {
      x: dir.x - 2 * dDotN * normal.x,
      y: dir.y - 2 * dDotN * normal.y
    };
  }

  // --------------------------------------------------------------------------
  // [2] Mathematical Intersections
  // --------------------------------------------------------------------------

  /**
   * Calculates intersection between two lines (Line-Line / Segment-Segment)
   * Supports bounded segments and infinite lines.
   */
  static intersectLineLine(p1, p2, p3, p4, segmentOnly = true) {
    const d1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const d2 = { x: p4.x - p3.x, y: p4.y - p3.y };

    const denom = GeoMath.cross(d1, d2);
    if (Math.abs(denom) < GeoMath.EPSILON) return null; // Parallel or collinear

    const delta = { x: p3.x - p1.x, y: p3.y - p1.y };
    const t = GeoMath.cross(delta, d2) / denom;
    const u = GeoMath.cross(delta, d1) / denom;

    if (segmentOnly) {
      if (t < -GeoMath.EPSILON || t > 1 + GeoMath.EPSILON ||
          u < -GeoMath.EPSILON || u > 1 + GeoMath.EPSILON) {
        return null;
      }
    }

    return {
      x: p1.x + t * d1.x,
      y: p1.y + t * d1.y,
      t: t,
      u: u
    };
  }

  /**
   * Intersection between a ray and a line segment.
   * Used for laser simulation against mirrors and obstacles.
   */
  static intersectRaySegment(rayOrigin, rayDir, segA, segB) {
    const segDir = { x: segB.x - segA.x, y: segB.y - segA.y };
    const denom = GeoMath.cross(rayDir, segDir);

    if (Math.abs(denom) < GeoMath.EPSILON) return null;

    const delta = { x: segA.x - rayOrigin.x, y: segA.y - rayOrigin.y };
    const t = GeoMath.cross(delta, segDir) / denom;
    const u = GeoMath.cross(delta, rayDir) / denom;

    if (t > GeoMath.EPSILON && u >= -GeoMath.EPSILON && u <= 1 + GeoMath.EPSILON) {
      return {
        x: rayOrigin.x + t * rayDir.x,
        y: rayOrigin.y + t * rayDir.y,
        distance: t,
        u: Math.max(0, Math.min(1, u))
      };
    }
    return null;
  }

  /**
   * Intersection between a line and a circle.
   * Solves quadratic equation: a*t^2 + b*t + c = 0
   */
  static intersectLineCircle(p1, p2, center, radius, segmentOnly = false) {
    const d = { x: p2.x - p1.x, y: p2.y - p1.y };
    const f = { x: p1.x - center.x, y: p1.y - center.y };

    const a = GeoMath.dot(d, d);
    const b = 2 * GeoMath.dot(f, d);
    const c = GeoMath.dot(f, f) - radius * radius;

    if (a < GeoMath.EPSILON) return [];

    const discriminant = b * b - 4 * a * c;
    if (discriminant < -GeoMath.EPSILON) return [];

    const intersections = [];
    const sqrtDisc = Math.sqrt(Math.max(0, discriminant));

    const t1 = (-b - sqrtDisc) / (2 * a);
    const t2 = (-b + sqrtDisc) / (2 * a);

    const checkAndAdd = (t) => {
      if (!segmentOnly || (t >= -GeoMath.EPSILON && t <= 1 + GeoMath.EPSILON)) {
        intersections.push({
          x: p1.x + t * d.x,
          y: p1.y + t * d.y,
          t: t
        });
      }
    };

    checkAndAdd(t1);
    if (discriminant > GeoMath.EPSILON) {
      checkAndAdd(t2);
    }

    return intersections;
  }

  /**
   * Intersection between two circles.
   */
  static intersectCircleCircle(c1, r1, c2, r2) {
    const d = GeoMath.distance(c1, c2);

    if (d < GeoMath.EPSILON) return [];
    if (d > r1 + r2 + GeoMath.EPSILON || d < Math.abs(r1 - r2) - GeoMath.EPSILON) {
      return [];
    }

    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const hSquared = r1 * r1 - a * a;
    const h = Math.sqrt(Math.max(0, hSquared));

    const p2 = {
      x: c1.x + (a * (c2.x - c1.x)) / d,
      y: c1.y + (a * (c2.y - c1.y)) / d
    };

    if (h < GeoMath.EPSILON) {
      return [p2]; // Tangent
    }

    return [
      {
        x: p2.x + (h * (c2.y - c1.y)) / d,
        y: p2.y - (h * (c2.x - c1.x)) / d
      },
      {
        x: p2.x - (h * (c2.y - c1.y)) / d,
        y: p2.y + (h * (c2.x - c1.x)) / d
      }
    ];
  }

  // --------------------------------------------------------------------------
  // [3] Projections, Distance & Circumcenter
  // --------------------------------------------------------------------------

  static closestPointOnSegment(p, a, b) {
    const ab = GeoMath.sub(b, a);
    const ap = GeoMath.sub(p, a);
    const abLenSq = GeoMath.dot(ab, ab);

    if (abLenSq < GeoMath.EPSILON) return { ...a, t: 0 };

    const t = Math.max(0, Math.min(1, GeoMath.dot(ap, ab) / abLenSq));
    return {
      x: a.x + t * ab.x,
      y: a.y + t * ab.y,
      t: t
    };
  }

  static closestPointOnCircle(p, center, radius) {
    const v = GeoMath.sub(p, center);
    const dist = GeoMath.length(v);
    if (dist < GeoMath.EPSILON) {
      return { x: center.x + radius, y: center.y, distToEdge: radius };
    }
    const unit = GeoMath.normalize(v);
    return {
      x: center.x + unit.x * radius,
      y: center.y + unit.y * radius,
      distToEdge: Math.abs(dist - radius)
    };
  }

  static getCircumcenter(A, B, C) {
    const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
    if (Math.abs(d) < GeoMath.EPSILON) return null; // Collinear points

    const aSq = A.x * A.x + A.y * A.y;
    const bSq = B.x * B.x + B.y * B.y;
    const cSq = C.x * C.x + C.y * C.y;

    const ux = (aSq * (B.y - C.y) + bSq * (C.y - A.y) + cSq * (A.y - B.y)) / d;
    const uy = (aSq * (C.x - B.x) + bSq * (A.x - C.x) + cSq * (B.x - A.x)) / d;

    const center = { x: ux, y: uy };
    const radius = GeoMath.distance(center, A);

    return { center, radius };
  }
}

if (typeof window !== 'undefined') {
  window.GeoMath = GeoMath;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GeoMath };
}
