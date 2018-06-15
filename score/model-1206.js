const config = [
  {
    "label": "group-1",
    "synth-0": [
      {
        "label": "part-1",
        "frequencies": [2093.005, 959.647, 1124.857],
        "gains": [0.523, 0.854, 0.717],
        "mappings": [
          {
            "axis": "x",
            "target": "detune",
            "range": [-10, 10]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.5, 0.04]
          }
        ]
      },
      {
        "label": "part-2",
        "frequencies": [277.183, 403.482, 604.540, 830.609, 1590.789],
        "gains": [0.891, 0.797, 0.688, 0.494, 0.485],
        "mappings": [
          {
            "axis": "x",
            "target": "detune",
            "range": [-15, 1]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.4, 0.01]
          }
        ]
      },
      {
        "label": "part-3",
        "frequencies": [233.082, 493.883, 698.456, 640.487],
        "gains": [0.887, 0.877, 0.787, 0.854],
        "mappings": [
          {
            "axis": "x",
            "target": "modRatio",
            "range": [0, 25]
          }, {
            "axis": "y",
            "target": "modFrequency",
            "range": [0, 80]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.6, 0.01]
          }
        ]
      },
      {
        "label": "part-4",
        "frequencies": [493.883, 2282.438, 959.647],
        "gains": [0.816, 0.589, 0.863],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0, 0.2]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 20]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [-20, 20]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.5, 0.04]
          }
        ]
      },
      {
        "label": "part-5",
        "frequencies": [783.990872, 854.948108, 1280.9748, 1396.912924, 1760.0, 1864.655044, 2093.00452],
        "gains": [0.59685, 0.488189, 0.294488, 0.285039, 0.275591, 0.270866, 0.233071],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0.1, 0.2]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [5, 20]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [-20, 20]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.2, 0.2]
          }
        ]
      },
      {
        "label": "part-6",
        "frequencies": [1523.344, 440, 1280.975, 854.948, 1523.344, 440, 1280.975, 854.948, 1523.344, 440, 1280.975, 854.948, 1523.344, 440, 1280.975, 854.948],
        "gains": [0.726, 0.872, 0.778, 0.830, 0.726, 0.872, 0.778, 0.830, 0.726, 0.872, 0.778, 0.830, 0.726, 0.872, 0.778, 0.830],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0, 0.3]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 20]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [0, 0]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [0, 0]
          }
        ]
      },
      {
        "label": "part-7",
        "frequencies": [1337.688],
        "gains": [0.627],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0.1, 0.4]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 10]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [0, 0]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.4, 0.2]
          }
        ]
      }
    ],
    "synth-1": [
      {
        "label": "part-1",
        "frequencies": [369.994, 806.964, 880, 1318.510, 1919.294],
        "gains": [0.901, 0.901, 0.764, 0.518, 0.509],
        "mappings": [
          {
            "axis": "x",
            "target": "detune",
            "range": [-15, 15]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.4, 0.1]
          }
        ]
      },
      {
        "label": "part-2",
        "frequencies": [640.487],
        "gains": [0.717],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0.05, 0.3]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 10]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.6, 0.1]
          }
        ]
      },
      {
        "label": "part-3",
        "frequencies": [631.305, 932.328, 1318.510, 1709.896],
        "gains": [0.872, 0.830, 0.698, 0.646],
        "mappings": [
          {
            "axis": "x",
            "target": "detune",
            "range": [-15, 15]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.3, 0.02]
          }
        ]
      },
      {
        "label": "part-4",
        "frequencies": [1919.294, 1031.499, 1046.502],
        "gains": [0.504, 0.603, 0.698],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0, 0.3]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 10]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [-5, 5]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.4, 0.1]
          }
        ]
      },
      {
        "label": "part-5",
        "frequencies": [261.625565, 297.93622, 403.481779, 452.892984, 486.802594, 523.251131, 570.609404, 783.990872, 806.963558, 880.0, 905.785968, 1141.218807, 1209.079209, 1376.885661, 1567.981742, 1760.0, 1811.571934, 2349.31814, 2418.158416],
        "gains": [0.648819, 0.469291, 0.511811, 0.691339, 0.247244, 0.247244, 0.790551, 0.393701, 0.388976, 0.398425, 0.332283, 0.280315, 0.313386, 0.308661, 0.223622, 0.214173, 0.209449, 0.223622, 0.223622],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0, 0.4]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 15]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [0, 0]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.2, 0.1]
          }
        ]
      }
    ]
  },
  {
    "label": "group-2",
    "synth-0": [
      {
        "label": "part-1",
        "frequencies": [932.328, 959.647, 2875.691, 3838.587, 4836.317, 1919.294, 2093.005, 1864.655],
        "gains": [0.608, 0.650, 0.438, 0.405, 0.466, 0.447, 0.457, 0.419],
        "mappings": [
          {
            "axis": "x",
            "target": "detune",
            "range": [-15, 15]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.4, 0.1]
          }
        ]
      },
      {
        "label": "part-2",
        "frequencies": [1567.982, 493.883, 1157.818, 622.254, 1209.079, 1567.982, 493.883, 1157.818, 622.254, 1209.079, 1567.982, 493.883, 1157.818, 622.254, 1209.079],
        "gains": [0.518, 0.820, 0.584, 0.702, 0.636, 0.518, 0.820, 0.584, 0.702, 0.636, 0.518, 0.820, 0.584, 0.702, 0.636],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0, 0.3]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 10]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [-15, 15]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.4, 0.1]
          }
        ]
      },
      {
        "label": "part-3",
        "frequencies": [2793.826, 2489.016, 233.082],
        "gains": [0.650, 0.759, 0.887],
        "mappings": [
          {
            "axis": "x",
            "target": "detune",
            "range": [-20, 15]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.5, 0.01]
          }
        ]
      },
      {
        "label": "part-4",
        "frequencies": [103.826, 123.471, 198.849, 427.474],
        "gains": [0.858, 0.844, 0.622, 0.688],
        "mappings": [
          {
            "axis": "x",
            "target": "modRatio",
            "range": [0, 30]
          }, {
            "axis": "y",
            "target": "modFrequency",
            "range": [0, 50]
          }
        ]
      },
      {
        "label": "part-5",
        "frequencies": [718.923, 1357.146, 1479.978],
        "gains": [0.802, 0.665, 0.518],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0, 0.2]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 10]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [-10, 10]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.2, 0.1]
          }
        ]
      }
    ],
    "synth-1": [
      {
        "label": "part-1",
        "frequencies": [195.998, 329.628, 339.286, 452.893, 554.365, 1280.975],
        "gains": [0.698, 0.646, 0.622, 0.565, 0.528, 0.528],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0, 0.3]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [5, 20]
          }
        ]
      },
      {
        "label": "part-2",
        "frequencies": [523.251131, 277.182631, 508.355187],
        "gains": [0.595276, 0.714961, 0.677165],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0.1, 0.3]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 10]
          }
        ]
      },
      {
        "label": "part-3",
        "frequencies": [195.997718, 261.625565, 297.93622, 452.892984, 459.480464, 486.802594, 523.251131, 530.861993, 570.609404, 578.909109, 905.785968, 1141.218807, 1376.885661, 2282.437613, 2714.291049],
        "gains": [0.313386, 0.337008, 0.337008, 0.40315, 0.696063, 0.237795, 0.218898, 0.24252, 0.327559, 0.790551, 0.308661, 0.294488, 0.308661, 0.204724, 0.214173],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0.1, 0.3]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 20]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [-15, 5]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.2, 0.1]
          }
        ]
      }
    ]
  },
  {
    "label": "group-3",
    "synth-0": [
      {
        "label": "part-1",
        "frequencies": [640.487, 1108.731, 1280.975, 1318.510, 1545.502, 1760, 1919.294, 2217.461, 2418.158, 2561.950, 2875.691, 3227.854, 5123.899],
        "gains": [0.797, 0.476, 0.688, 0.424, 0.419, 0.494, 0.471, 0.414, 0.433, 0.485, 0.405, 0.433, 0.414],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0, 0.3]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 10]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [-10, 10]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.4, 0.1]
          }
        ]
      },
      {
        "label": "part-2",
        "frequencies": [4836.317, 932.328, 959.647, 2875.691, 3838.587, 1864.655, 1919.294, 2093.005, 640.487, 1108.731, 1280.975, 1318.510, 1545.502, 1760, 1919.294, 2217.461, 2418.158, 2561.950, 2875.691, 3227.854, 5123.899],
        "gains": [0.466, 0.608, 0.650, 0.438, 0.405, 0.419, 0.447, 0.457, 0.797, 0.476, 0.688, 0.424, 0.419, 0.494, 0.471, 0.414, 0.433, 0.485, 0.405, 0.433, 0.414],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0, 0.3]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 10]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [-15, 10]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.4, 0.1]
          }
        ]
      },
      {
        "label": "part-3",
        "frequencies": [1864.655, 2033.421, 1811.572, 4698.636, 905.786, 932.328, 2793.826, 3729.310, 622.254, 1077.167, 1244.508, 1280.975, 1501.504, 1709.896, 1864.655, 2154.334, 2349.318, 2489.016, 2793.826, 3135.963, 4978.032, 1864.655, 2033.421, 1811.572],
        "gains": [0.447, 0.457, 0.419, 0.466, 0.608, 0.650, 0.438, 0.405, 0.797, 0.476, 0.688, 0.424, 0.419, 0.494, 0.471, 0.414, 0.433, 0.485, 0.405, 0.433, 0.414, 0.447, 0.457, 0.419],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0, 0.4]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 10]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [-15, 10]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.4, 0.1]
          }
        ]
      },
      {
        "label": "part-4",
        "frequencies": [3046.689],
        "gains": [0.740],
        "mappings": [
          {
            "axis": "x",
            "target": "detune",
            "range": [-15, 10]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.5, 0.1]
          }
        ]
      },
      {
        "label": "part-5",
        "frequencies": [302.270, 339.286, 493.883, 631.305, 1077.167, 1174.659],
        "gains": [0.872, 0.698, 0.646, 0.622, 0.565, 0.528],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0.1, 0.5]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 20]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.3, 0.02]
          }
        ]
      },
      {
        "label": "part-6",
        "frequencies": [207.652, 146.832, 246.942, 269.292, 311.127, 479.823, 207.652, 146.832, 246.942, 269.292, 311.127, 479.823, 207.652, 146.832, 246.942, 269.292, 311.127, 479.823, 207.652, 146.832, 246.942, 269.292, 311.127, 479.823, 207.652, 146.832, 246.942, 269.292, 311.127, 479.823],
        "gains": [0.773, 0.882, 0.627, 0.754, 0.764, 0.688, 0.773, 0.882, 0.627, 0.754, 0.764, 0.688, 0.773, 0.882, 0.627, 0.754, 0.764, 0.688, 0.773, 0.882, 0.627, 0.754, 0.764, 0.688, 0.773, 0.882, 0.627, 0.754, 0.764, 0.688],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0, 0.3]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 10]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [-15, 15]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.4, 0.1]
          }
        ]
      },
      {
        "label": "part-7",
        "frequencies": [246.942, 479.823, 515.749],
        "gains": [0.891, 0.665, 0.556],
        "mappings": [
          {
            "axis": "x",
            "target": "modRatio",
            "range": [5, 20]
          }, {
            "axis": "y",
            "target": "modFrequency",
            "range": [0, 100]
          }
        ]
      },
      {
        "label": "part-8",
        "frequencies": [493.883, 1396.913, 1141.219],
        "gains": [0.844, 0.532, 0.660],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0, 0]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 0]
          }, {
            "axis": "x",
            "target": "detune",
            "range": [-15, 15]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.5, 0.05]
          }
        ]
      }
    ],
    "synth-1": [
      {
        "label": "part-1",
        "frequencies": [69.295658, 320.2437, 391.995436, 538.583559, 918.960928],
        "gains": [0.733858, 0.664567, 0.592126, 0.462992, 0.456693],
        "mappings": [
          {
            "axis": "x",
            "target": "tremoloDepth",
            "range": [0.1, 0.3]
          }, {
            "axis": "y",
            "target": "tremoloFrequency",
            "range": [0, 20]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.2, 0.1]
          }
        ]
      },
      {
        "label": "part-2",
        "frequencies": [761.672173, 1919.293607, 783.990872],
        "gains": [0.573228, 0.445669, 0.549606],
        "mappings": [
          {
            "axis": "x",
            "target": "detune",
            "range": [-15, 15]
          }, {
            "axis": "y",
            "target": "gain",
            "range": [-0.3, 0.2]
          }
        ]
      }
    ]
  }
];

module.exports = config;
