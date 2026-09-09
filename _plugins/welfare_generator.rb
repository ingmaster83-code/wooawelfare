require 'json'

module Jekyll
  class WelfarePageGenerator < Generator
    safe true
    priority :normal

    def generate(site)
      items = load_json(site, '_rawdata/welfare.json')

      Jekyll.logger.info "WelfareGenerator:", "#{items.size}개 복지시설 페이지 생성 중..."
      items.each do |w|
        next if w['slug'].to_s.strip.empty?
        site.pages << WelfarePage.new(site, w)
      end

      Jekyll.logger.info "WelfareGenerator:", "완료 (#{items.size}개)"
    end

    private

    def load_json(site, path)
      file = File.join(site.source, path)
      return [] unless File.exist?(file)
      JSON.parse(File.read(file, encoding: 'utf-8'))
    rescue => e
      Jekyll.logger.warn "WelfareGenerator:", "#{path} 로드 실패: #{e.message}"
      []
    end
  end

  class WelfarePage < Page
    def initialize(site, w)
      @site = site
      @base = site.source
      @dir  = "welfare/#{w['slug']}"
      @name = 'index.html'

      self.process(@name)
      self.read_yaml(File.join(@base, '_layouts'), 'welfare.html')
      self.data.merge!(w)
      self.data['layout']      = 'welfare'
      self.data['title']       = build_title(w)
      self.data['description'] = build_desc(w)
    end

    private

    def build_title(w)
      loc = [w['sido_nm'], w['sggu_nm']].compact.join(' ')
      "#{w['welfareName']} #{loc} 위치·전화번호"
    end

    def build_desc(w)
      loc = [w['sido_nm'], w['sggu_nm']].compact.join(' ')
      "#{loc} #{w['category']} #{w['welfareName']}의 주소, 전화번호를 확인하세요."[0, 155]
    end
  end
end
